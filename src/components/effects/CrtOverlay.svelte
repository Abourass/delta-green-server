<script lang="ts">
	import { onMount } from 'svelte';

	// Portions of the shader math are adapted from:
	// https://github.com/gingerbeardman/webgl-crt-shader (MIT)
	type RendererMode = 'css' | 'webgl';
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
		time: WebGLUniformLocation | null;
		scanlineIntensity: WebGLUniformLocation | null;
		scanlineCount: WebGLUniformLocation | null;
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

		uniform float uTime;
		uniform float uScanlineIntensity;
		uniform float uScanlineCount;
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
				float scanlineY = curvedUv.y * uScanlineCount;
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

		void main() {
			vec2 uv = vUv;
			float baseMask = lightingMaskAt(uv, uTime);
			vec3 maskColor = vec3(baseMask);

			if (uRgbShift > 0.001) {
				float shift = uRgbShift * 0.0025;
				maskColor.r = lightingMaskAt(uv + vec2(shift, 0.0), uTime);
				maskColor.g = baseMask;
				maskColor.b = lightingMaskAt(uv - vec2(shift, 0.0), uTime);
			}

			// The overlay only darkens/attenuates the scene, so higher brightness moves the mask toward white.
			float brightnessMix = 1.0 / max(uBrightness, 0.001);
			maskColor = mix(vec3(1.0), maskColor, brightnessMix);
			maskColor = (maskColor - 0.5) * uContrast + 0.5;
			float luminance = dot(maskColor, LUMA);
			maskColor = mix(vec3(luminance), maskColor, uSaturation);

			if (uBloomIntensity > 0.001) {
				float bloomSeed = max(maskColor.r, max(maskColor.g, maskColor.b));
				float bloomMask = smoothstep(uBloomThreshold * 0.5, 1.0, bloomSeed);
				maskColor = mix(maskColor, vec3(1.0), bloomMask * uBloomIntensity * 0.35);
			}

			fragColor = vec4(clamp(maskColor, 0.0, 1.0), 1.0);
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
	let frameHandle = 0;
	let rendererMode = $state<RendererMode>('css');

	const setRendererMode = (nextMode: RendererMode) => {
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
		time: gl.getUniformLocation(shaderProgram, 'uTime'),
		scanlineIntensity: gl.getUniformLocation(shaderProgram, 'uScanlineIntensity'),
		scanlineCount: gl.getUniformLocation(shaderProgram, 'uScanlineCount'),
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

	const renderFrame = (timeSeconds: number) => {
		if (!glContext || !uniforms || !program) {
			return;
		}

		const activeShader = shader;
		const flickerStrength = flicker && !reducedMotion ? activeShader.flickerStrength : 0;

		glContext.useProgram(program);
		glContext.uniform1f(uniforms.time, reducedMotion ? 0 : timeSeconds);
		glContext.uniform1f(uniforms.scanlineIntensity, activeShader.scanlineIntensity);
		glContext.uniform1f(uniforms.scanlineCount, activeShader.scanlineCount);
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

		if (reducedMotion) {
			renderFrame(0);
			return;
		}

		const loop = (timestampMs: number) => {
			renderFrame(timestampMs * 0.001);
			frameHandle = requestAnimationFrame(loop);
		};

		frameHandle = requestAnimationFrame(loop);
	};

	const handleResize = () => {
		resizeCanvas();
		renderFrame(performance.now() * 0.001);
	};

	const teardown = () => {
		stopAnimation();

		if (glContext && positionBuffer) {
			glContext.deleteBuffer(positionBuffer);
		}

		if (glContext && program) {
			glContext.deleteProgram(program);
		}

		positionBuffer = null;
		program = null;
		uniforms = null;
		glContext = null;
	};

	onMount(() => {
		if (!canvasEl) {
			setRendererMode('css');
			return;
		}

		const context = canvasEl.getContext('webgl2', {
			alpha: true,
			antialias: false,
			depth: false,
			stencil: false,
			preserveDrawingBuffer: false,
			premultipliedAlpha: true,
			powerPreference: 'high-performance'
		});

		if (!context) {
			setRendererMode('css');
			return;
		}

		try {
			glContext = context;
			program = createProgram(context);
			context.useProgram(program);
			positionBuffer = setupGeometry(context, program);
			uniforms = getUniforms(context, program);

			resizeCanvas();
			setRendererMode('webgl');
			startAnimation();
		} catch {
			teardown();
			setRendererMode('css');
		}

		window.addEventListener('resize', handleResize, { passive: true });

		return () => {
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

		startAnimation();
		renderFrame(performance.now() * 0.001);
	});
</script>

<canvas
	bind:this={canvasEl}
	class="crt-overlay"
	class:crt-overlay--active={rendererMode === 'webgl'}
	aria-hidden="true"
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
	}

	.crt-overlay--active {
		display: block;
	}
</style>
