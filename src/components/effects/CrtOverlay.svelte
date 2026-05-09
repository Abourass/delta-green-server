<script lang="ts">
	import { onMount } from 'svelte';

	// Portions of the shader math are adapted from:
	// https://github.com/gingerbeardman/webgl-crt-shader (MIT)
	type RendererMode = 'css' | 'webgl';
	type Html2CanvasFn = typeof import('html2canvas')['default'];
	type CrtShaderParams = {
		scanlineIntensity: number;
		scanlineCount: number;
		adaptiveIntensity: number;
		brightness: number;
		contrast: number;
		saturation: number;
		bloomIntensity: number;
		bloomThreshold: number;
		rgbShift: number;
		vignetteStrength: number;
		curvature: number;
		flickerStrength: number;
	};

	type CrtOverlayProps = {
		shader?: CrtShaderParams;
		flicker?: boolean;
		reducedMotion?: boolean;
		onRendererChange?: (mode: RendererMode) => void;
	};

	type UniformMap = {
		texture: WebGLUniformLocation | null;
		hasSource: WebGLUniformLocation | null;
		time: WebGLUniformLocation | null;
		scanlineIntensity: WebGLUniformLocation | null;
		scanlineCount: WebGLUniformLocation | null;
		yOffset: WebGLUniformLocation | null;
		brightness: WebGLUniformLocation | null;
		contrast: WebGLUniformLocation | null;
		saturation: WebGLUniformLocation | null;
		bloomIntensity: WebGLUniformLocation | null;
		bloomThreshold: WebGLUniformLocation | null;
		rgbShift: WebGLUniformLocation | null;
		adaptiveIntensity: WebGLUniformLocation | null;
		vignetteStrength: WebGLUniformLocation | null;
		curvature: WebGLUniformLocation | null;
		flickerStrength: WebGLUniformLocation | null;
	};

	const PIXEL_RATIO_CAP = 2;
	const CAPTURE_SCALE = 1;
	const CAPTURE_INTERVAL_MS = 1000 / 15;
	const REDUCED_CAPTURE_INTERVAL_MS = 600;
	const DEFAULT_SHADER_PARAMS: CrtShaderParams = {
		scanlineIntensity: 0.5,
		scanlineCount: 256,
		adaptiveIntensity: 0.3,
		brightness: 1.5,
		contrast: 1.05,
		saturation: 1.1,
		bloomIntensity: 0.5,
		bloomThreshold: 0.5,
		rgbShift: 1,
		vignetteStrength: 0.3,
		curvature: 0.1,
		flickerStrength: 0.01
	};

	const vertexSource = `#version 300 es
		in vec2 aPosition;
		out vec2 vUv;

		void main() {
			vUv = aPosition * 0.5 + 0.5;
			gl_Position = vec4(aPosition, 0.0, 1.0);
		}
	`;

	const fragmentSource = `#version 300 es
		#ifdef GL_FRAGMENT_PRECISION_HIGH
			precision highp float;
		#else
			precision mediump float;
		#endif

		uniform sampler2D uTexture;
		uniform float uHasSource;
		uniform float uTime;
		uniform float uScanlineIntensity;
		uniform float uScanlineCount;
		uniform float uYOffset;
		uniform float uBrightness;
		uniform float uContrast;
		uniform float uSaturation;
		uniform float uBloomIntensity;
		uniform float uBloomThreshold;
		uniform float uRgbShift;
		uniform float uAdaptiveIntensity;
		uniform float uVignetteStrength;
		uniform float uCurvature;
		uniform float uFlickerStrength;

		in vec2 vUv;
		out vec4 fragColor;

		const float PI = 3.14159265;
		const vec3 LUMA = vec3(0.299, 0.587, 0.114);
		const float BLOOM_THRESHOLD_FACTOR = 0.5;
		const float BLOOM_FACTOR_MULT = 1.5;
		const float RGB_SHIFT_SCALE = 0.005;
		const float RGB_SHIFT_INTENSITY = 0.08;

		vec2 curveRemapUV(vec2 uv, float curvature) {
			vec2 coords = uv * 2.0 - 1.0;
			float curveAmount = curvature * 0.25;
			float dist = dot(coords, coords);
			coords = coords * (1.0 + dist * curveAmount);
			return coords * 0.5 + 0.5;
		}

		float vignetteApprox(vec2 uv, float strength) {
			vec2 vigCoord = uv * 2.0 - 1.0;
			float dist = max(abs(vigCoord.x), abs(vigCoord.y));
			return clamp(1.0 - dist * dist * strength, 0.0, 1.0);
		}

		float lightingMaskAt(vec2 uv, float timeValue) {
			vec2 curvedUv = uv;

			if (uCurvature > 0.001) {
				curvedUv = curveRemapUV(curvedUv, uCurvature);
				if (
					curvedUv.x < 0.0 ||
					curvedUv.x > 1.0 ||
					curvedUv.y < 0.0 ||
					curvedUv.y > 1.0
				) {
					return 0.0;
				}
			}

			float lightingMask = 1.0;

			if (uScanlineIntensity > 0.001) {
				float scanlineY = (curvedUv.y + uYOffset) * uScanlineCount;
				float scanlinePattern = abs(sin(scanlineY * PI));
				float adaptiveFactor = 1.0;

				if (uAdaptiveIntensity > 0.001) {
					float yPattern = sin(curvedUv.y * 30.0) * 0.5 + 0.5;
					adaptiveFactor = 1.0 - yPattern * uAdaptiveIntensity * 0.2;
				}

				lightingMask *= 1.0 - scanlinePattern * uScanlineIntensity * adaptiveFactor;
			}

			if (uFlickerStrength > 0.001) {
				lightingMask *= 1.0 + sin(timeValue * 110.0) * uFlickerStrength;
			}

			if (uVignetteStrength > 0.001) {
				lightingMask *= vignetteApprox(curvedUv, uVignetteStrength);
			}

			return clamp(lightingMask, 0.0, 1.0);
		}

		vec4 sampleBloom(vec2 uv, float radius, vec4 centerSample) {
			vec2 o = vec2(radius);
			vec4 c = centerSample * 0.4;
			vec4 cross = (
				texture(uTexture, uv + vec2(o.x, 0.0)) +
				texture(uTexture, uv - vec2(o.x, 0.0)) +
				texture(uTexture, uv + vec2(0.0, o.y)) +
				texture(uTexture, uv - vec2(0.0, o.y))
			) * 0.15;
			return c + cross;
		}

		void main() {
			vec2 uv = vUv;

			if (uHasSource < 0.5) {
				float baseMask = lightingMaskAt(uv, uTime);
				vec3 maskColor = vec3(baseMask);

				if (uRgbShift > 0.001) {
					float shift = uRgbShift * 0.0025;
					maskColor.r = lightingMaskAt(uv + vec2(shift, 0.0), uTime);
					maskColor.g = baseMask;
					maskColor.b = lightingMaskAt(uv - vec2(shift, 0.0), uTime);
				}

				float brightnessMix = 1.0 / max(uBrightness, 0.001);
				maskColor = mix(vec3(1.0), maskColor, brightnessMix);
				maskColor = (maskColor - 0.5) * uContrast + 0.5;
				float fallbackLuminance = dot(maskColor, LUMA);
				maskColor = mix(vec3(fallbackLuminance), maskColor, uSaturation);

				if (uBloomIntensity > 0.001) {
					float bloomSeed = max(maskColor.r, max(maskColor.g, maskColor.b));
					float bloomMask = smoothstep(uBloomThreshold * 0.5, 1.0, bloomSeed);
					maskColor = mix(maskColor, vec3(1.0), bloomMask * uBloomIntensity * 0.35);
				}

				fragColor = vec4(clamp(maskColor, 0.0, 1.0), 1.0);
				return;
			}

			if (uCurvature > 0.001) {
				uv = curveRemapUV(uv, uCurvature);
				if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
					fragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
			}

			vec4 pixel = texture(uTexture, uv);

			if (uBloomIntensity > 0.001) {
				float pixelLum = dot(pixel.rgb, LUMA);
				float bloomThresholdHalf = uBloomThreshold * BLOOM_THRESHOLD_FACTOR;
				if (pixelLum > bloomThresholdHalf) {
					vec4 bloomSample = sampleBloom(uv, 0.005, pixel);
					bloomSample.rgb *= uBrightness;
					float bloomLum = dot(bloomSample.rgb, LUMA);
					float bloomFactor = uBloomIntensity * max(0.0, (bloomLum - uBloomThreshold) * BLOOM_FACTOR_MULT);
					pixel.rgb += bloomSample.rgb * bloomFactor;
				}
			}

			if (uRgbShift > 0.001) {
				float shift = uRgbShift * RGB_SHIFT_SCALE;
				pixel.r += texture(uTexture, vec2(uv.x + shift, uv.y)).r * RGB_SHIFT_INTENSITY;
				pixel.b += texture(uTexture, vec2(uv.x - shift, uv.y)).b * RGB_SHIFT_INTENSITY;
			}

			pixel.rgb *= uBrightness;
			float luminance = dot(pixel.rgb, LUMA);
			pixel.rgb = (pixel.rgb - 0.5) * uContrast + 0.5;
			pixel.rgb = mix(vec3(luminance), pixel.rgb, uSaturation);

			float lightingMask = 1.0;
			if (uScanlineIntensity > 0.001) {
				float scanlineY = (uv.y + uYOffset) * uScanlineCount;
				float scanlinePattern = abs(sin(scanlineY * PI));
				float adaptiveFactor = 1.0;
				if (uAdaptiveIntensity > 0.001) {
					float yPattern = sin(uv.y * 30.0) * 0.5 + 0.5;
					adaptiveFactor = 1.0 - yPattern * uAdaptiveIntensity * 0.2;
				}
				lightingMask *= 1.0 - scanlinePattern * uScanlineIntensity * adaptiveFactor;
			}

			if (uFlickerStrength > 0.001) {
				lightingMask *= 1.0 + sin(uTime * 110.0) * uFlickerStrength;
			}

			if (uVignetteStrength > 0.001) {
				lightingMask *= vignetteApprox(uv, uVignetteStrength);
			}

			pixel.rgb *= lightingMask;
			fragColor = vec4(clamp(pixel.rgb, 0.0, 1.0), 1.0);
		}
	`;

	let {
		shader = DEFAULT_SHADER_PARAMS,
		flicker = true,
		reducedMotion = false,
		onRendererChange = () => {}
	}: CrtOverlayProps = $props();

	let canvasEl: HTMLCanvasElement | null = null;
	let glContext: WebGL2RenderingContext | null = null;
	let uniforms: UniformMap | null = null;
	let program: WebGLProgram | null = null;
	let positionBuffer: WebGLBuffer | null = null;
	let sourceTexture: WebGLTexture | null = null;
	let frameHandle = 0;
	let rendererMode = $state<RendererMode>('css');
	let html2canvasFn: Html2CanvasFn | null = null;
	let captureInFlight = false;
	let sourceReady = $state(false);
	let sourceWidth = 0;
	let sourceHeight = 0;
	let lastCaptureAtMs = 0;
	let componentMounted = false;

	const setRendererMode = (nextMode: RendererMode) => {
		if (rendererMode === nextMode) {
			return;
		}
		rendererMode = nextMode;
		onRendererChange(nextMode);
	};

	const compileShader = (
		gl: WebGL2RenderingContext,
		type: number,
		source: string
	): WebGLShader => {
		const shader = gl.createShader(type);
		if (!shader) {
			throw new Error('Unable to create shader object.');
		}

		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(shader) || 'Unknown shader compile error.';
			gl.deleteShader(shader);
			throw new Error(info);
		}

		return shader;
	};

	const createProgram = (gl: WebGL2RenderingContext): WebGLProgram => {
		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
		const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

		const nextProgram = gl.createProgram();
		if (!nextProgram) {
			gl.deleteShader(vertexShader);
			gl.deleteShader(fragmentShader);
			throw new Error('Unable to create WebGL program.');
		}

		gl.attachShader(nextProgram, vertexShader);
		gl.attachShader(nextProgram, fragmentShader);
		gl.linkProgram(nextProgram);

		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);

		if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(nextProgram) || 'Unknown shader link error.';
			gl.deleteProgram(nextProgram);
			throw new Error(info);
		}

		return nextProgram;
	};

	const setupGeometry = (gl: WebGL2RenderingContext, shaderProgram: WebGLProgram) => {
		const buffer = gl.createBuffer();
		if (!buffer) {
			throw new Error('Unable to create position buffer.');
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			gl.STATIC_DRAW
		);

		const positionHandle = gl.getAttribLocation(shaderProgram, 'aPosition');
		if (positionHandle === -1) {
			gl.deleteBuffer(buffer);
			throw new Error('Unable to locate position attribute.');
		}

		gl.enableVertexAttribArray(positionHandle);
		gl.vertexAttribPointer(positionHandle, 2, gl.FLOAT, false, 0, 0);
		return buffer;
	};

	const getUniforms = (gl: WebGL2RenderingContext, shaderProgram: WebGLProgram): UniformMap => ({
		texture: gl.getUniformLocation(shaderProgram, 'uTexture'),
		hasSource: gl.getUniformLocation(shaderProgram, 'uHasSource'),
		time: gl.getUniformLocation(shaderProgram, 'uTime'),
		scanlineIntensity: gl.getUniformLocation(shaderProgram, 'uScanlineIntensity'),
		scanlineCount: gl.getUniformLocation(shaderProgram, 'uScanlineCount'),
		yOffset: gl.getUniformLocation(shaderProgram, 'uYOffset'),
		brightness: gl.getUniformLocation(shaderProgram, 'uBrightness'),
		contrast: gl.getUniformLocation(shaderProgram, 'uContrast'),
		saturation: gl.getUniformLocation(shaderProgram, 'uSaturation'),
		bloomIntensity: gl.getUniformLocation(shaderProgram, 'uBloomIntensity'),
		bloomThreshold: gl.getUniformLocation(shaderProgram, 'uBloomThreshold'),
		rgbShift: gl.getUniformLocation(shaderProgram, 'uRgbShift'),
		adaptiveIntensity: gl.getUniformLocation(shaderProgram, 'uAdaptiveIntensity'),
		vignetteStrength: gl.getUniformLocation(shaderProgram, 'uVignetteStrength'),
		curvature: gl.getUniformLocation(shaderProgram, 'uCurvature'),
		flickerStrength: gl.getUniformLocation(shaderProgram, 'uFlickerStrength')
	});

	const resizeCanvas = () => {
		if (!canvasEl || !glContext) {
			return;
		}

		const dpr = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP);
		const width = Math.max(1, Math.floor(window.innerWidth * dpr));
		const height = Math.max(1, Math.floor(window.innerHeight * dpr));

		if (canvasEl.width !== width || canvasEl.height !== height) {
			canvasEl.width = width;
			canvasEl.height = height;
		}

		glContext.viewport(0, 0, width, height);
	};

	const createSourceTexture = (gl: WebGL2RenderingContext) => {
		const texture = gl.createTexture();
		if (!texture) {
			throw new Error('Unable to create source texture.');
		}

		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([0, 0, 0, 255])
		);

		return texture;
	};

	const uploadSourceCanvas = (sourceCanvas: HTMLCanvasElement) => {
		if (!glContext || !sourceTexture) {
			return;
		}

		glContext.bindTexture(glContext.TEXTURE_2D, sourceTexture);
		glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, true);

		if (!sourceReady || sourceCanvas.width !== sourceWidth || sourceCanvas.height !== sourceHeight) {
			sourceWidth = sourceCanvas.width;
			sourceHeight = sourceCanvas.height;
			glContext.texImage2D(
				glContext.TEXTURE_2D,
				0,
				glContext.RGBA,
				glContext.RGBA,
				glContext.UNSIGNED_BYTE,
				sourceCanvas
			);
			sourceReady = true;
		} else {
			glContext.texSubImage2D(
				glContext.TEXTURE_2D,
				0,
				0,
				0,
				glContext.RGBA,
				glContext.UNSIGNED_BYTE,
				sourceCanvas
			);
		}
	};

	const shouldIgnoreElement = (element: Element) => {
		if (!(element instanceof HTMLElement)) {
			return false;
		}

		return element.dataset.crtIgnore === 'true' || element.dataset.html2canvasIgnore !== undefined;
	};

	const captureSourceFrame = async () => {
		if (!html2canvasFn || !componentMounted || captureInFlight) {
			return;
		}

		captureInFlight = true;
		try {
			const snapshot = await html2canvasFn(document.body, {
				backgroundColor: null,
				logging: false,
				removeContainer: true,
				useCORS: true,
				scale: Math.min(window.devicePixelRatio || 1, CAPTURE_SCALE),
				width: window.innerWidth,
				height: window.innerHeight,
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				ignoreElements: shouldIgnoreElement
			});

			uploadSourceCanvas(snapshot);
			lastCaptureAtMs = performance.now();
			renderFrame(lastCaptureAtMs * 0.001);
		} catch {
			// Keep WebGL active and rely on procedural fallback if capture fails.
		} finally {
			captureInFlight = false;
		}
	};

	const renderFrame = (timeSeconds: number) => {
		if (!glContext || !uniforms || !program || !sourceTexture) {
			return;
		}

		const activeShader = shader;
		const flickerStrength = flicker && !reducedMotion ? activeShader.flickerStrength : 0;

		glContext.useProgram(program);
		glContext.activeTexture(glContext.TEXTURE0);
		glContext.bindTexture(glContext.TEXTURE_2D, sourceTexture);
		glContext.uniform1i(uniforms.texture, 0);
		glContext.uniform1f(uniforms.hasSource, sourceReady ? 1 : 0);
		glContext.uniform1f(uniforms.time, reducedMotion ? 0 : timeSeconds);
		glContext.uniform1f(uniforms.scanlineIntensity, activeShader.scanlineIntensity);
		glContext.uniform1f(uniforms.scanlineCount, activeShader.scanlineCount);
		glContext.uniform1f(uniforms.yOffset, 0);
		glContext.uniform1f(uniforms.brightness, activeShader.brightness);
		glContext.uniform1f(uniforms.contrast, activeShader.contrast);
		glContext.uniform1f(uniforms.saturation, activeShader.saturation);
		glContext.uniform1f(uniforms.bloomIntensity, activeShader.bloomIntensity);
		glContext.uniform1f(uniforms.bloomThreshold, activeShader.bloomThreshold);
		glContext.uniform1f(uniforms.rgbShift, activeShader.rgbShift);
		glContext.uniform1f(uniforms.adaptiveIntensity, activeShader.adaptiveIntensity);
		glContext.uniform1f(uniforms.vignetteStrength, activeShader.vignetteStrength);
		glContext.uniform1f(uniforms.curvature, activeShader.curvature);
		glContext.uniform1f(uniforms.flickerStrength, flickerStrength);

		glContext.drawArrays(glContext.TRIANGLE_STRIP, 0, 4);
	};

	const stopAnimation = () => {
		if (frameHandle) {
			cancelAnimationFrame(frameHandle);
			frameHandle = 0;
		}
	};

	const startAnimation = () => {
		if (rendererMode !== 'webgl') {
			return;
		}

		stopAnimation();

		const loop = (timestampMs: number) => {
			const captureInterval = reducedMotion ? REDUCED_CAPTURE_INTERVAL_MS : CAPTURE_INTERVAL_MS;
			if (timestampMs - lastCaptureAtMs >= captureInterval && !captureInFlight) {
				void captureSourceFrame();
			}

			renderFrame(timestampMs * 0.001);
			frameHandle = requestAnimationFrame(loop);
		};

		frameHandle = requestAnimationFrame(loop);
	};

	const handleResize = () => {
		resizeCanvas();
		lastCaptureAtMs = 0;
		void captureSourceFrame();
	};

	const teardown = () => {
		stopAnimation();

		if (glContext && positionBuffer) {
			glContext.deleteBuffer(positionBuffer);
		}

		if (glContext && program) {
			glContext.deleteProgram(program);
		}

		if (glContext && sourceTexture) {
			glContext.deleteTexture(sourceTexture);
		}

		positionBuffer = null;
		program = null;
		uniforms = null;
		sourceTexture = null;
		glContext = null;
		sourceReady = false;
		sourceWidth = 0;
		sourceHeight = 0;
		captureInFlight = false;
		lastCaptureAtMs = 0;
		html2canvasFn = null;
	};

	onMount(() => {
		componentMounted = true;

		if (typeof window === 'undefined') {
			setRendererMode('css');
			return () => {
				componentMounted = false;
			};
		}

		if (!canvasEl) {
			setRendererMode('css');
			return () => {
				componentMounted = false;
			};
		}

		const initialize = async () => {
			try {
				try {
					const module = await import('html2canvas');
					html2canvasFn = module.default;
				} catch {
					html2canvasFn = null;
				}

				if (!componentMounted || !canvasEl) {
					return;
				}

				const context = canvasEl.getContext('webgl2', {
					alpha: false,
					antialias: false,
					depth: false,
					stencil: false,
					preserveDrawingBuffer: false,
					premultipliedAlpha: false,
					powerPreference: 'high-performance'
				});

				if (!context) {
					setRendererMode('css');
					return;
				}

				glContext = context;
				program = createProgram(context);
				context.useProgram(program);
				positionBuffer = setupGeometry(context, program);
				uniforms = getUniforms(context, program);
				sourceTexture = createSourceTexture(context);
				resizeCanvas();

				setRendererMode('webgl');
				if (html2canvasFn) {
					await captureSourceFrame();
				}
				startAnimation();
				window.addEventListener('resize', handleResize, { passive: true });
			} catch {
				teardown();
				setRendererMode('css');
			}
		};

		void initialize();

		return () => {
			componentMounted = false;
			window.removeEventListener('resize', handleResize);
			teardown();
		};
	});

	$effect(() => {
		if (rendererMode !== 'webgl') {
			return;
		}

		const dependencyHash =
			shader.scanlineIntensity +
			shader.scanlineCount +
			shader.adaptiveIntensity +
			shader.brightness +
			shader.contrast +
			shader.saturation +
			shader.bloomIntensity +
			shader.bloomThreshold +
			shader.rgbShift +
			shader.vignetteStrength +
			shader.curvature +
			shader.flickerStrength +
			(flicker ? 1 : 0) +
			(reducedMotion ? 1 : 0);
		void dependencyHash;

		if (!captureInFlight) {
			void captureSourceFrame();
		}
		renderFrame(performance.now() * 0.001);
	});
</script>

<canvas
	bind:this={canvasEl}
	class="crt-overlay"
	class:crt-overlay--active={rendererMode === 'webgl'}
	class:crt-overlay--source={sourceReady}
	aria-hidden="true"
	data-crt-ignore="true"
	data-html2canvas-ignore="true"
></canvas>

<style>
	.crt-overlay {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		pointer-events: none;
		z-index: 30;
		display: none;
		mix-blend-mode: multiply;
		background: transparent;
	}

	.crt-overlay--active {
		display: block;
	}

	.crt-overlay--source {
		mix-blend-mode: normal;
		background: #000;
		isolation: isolate;
	}
</style>
