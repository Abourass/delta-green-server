<script lang="ts">
	import { onMount } from 'svelte';

	// Portions of the shader math are adapted from:
	// https://github.com/gingerbeardman/webgl-crt-shader (MIT)
	type CrtIntensity = 'off' | 'low' | 'high';
	type RendererMode = 'css' | 'webgl';

	type CrtOverlayProps = {
		intensity?: CrtIntensity;
		flicker?: boolean;
		reducedMotion?: boolean;
		onRendererChange?: (mode: RendererMode) => void;
	};

	type ShaderProfile = {
		scanlineIntensity: number;
		scanlineCount: number;
		adaptiveIntensity: number;
		vignetteStrength: number;
		curvature: number;
	};

	type UniformMap = {
		time: WebGLUniformLocation | null;
		scanlineIntensity: WebGLUniformLocation | null;
		scanlineCount: WebGLUniformLocation | null;
		adaptiveIntensity: WebGLUniformLocation | null;
		vignetteStrength: WebGLUniformLocation | null;
		curvature: WebGLUniformLocation | null;
		flickerStrength: WebGLUniformLocation | null;
	};

	const PIXEL_RATIO_CAP = 2;
	const FLICKER_STRENGTH_DEFAULT = 0.01;

	const SHADER_PROFILES: Record<CrtIntensity, ShaderProfile> = {
		off: {
			scanlineIntensity: 0,
			scanlineCount: 256,
			adaptiveIntensity: 0,
			vignetteStrength: 0.08,
			curvature: 0.04
		},
		low: {
			scanlineIntensity: 0.24,
			scanlineCount: 300,
			adaptiveIntensity: 0.2,
			vignetteStrength: 0.18,
			curvature: 0.08
		},
		high: {
			scanlineIntensity: 0.5,
			scanlineCount: 256,
			adaptiveIntensity: 0.3,
			vignetteStrength: 0.3,
			curvature: 0.1
		}
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
		uniform float uAdaptiveIntensity;
		uniform float uVignetteStrength;
		uniform float uCurvature;
		uniform float uFlickerStrength;

		in vec2 vUv;
		out vec4 fragColor;

		const float PI = 3.14159265;

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

		void main() {
			vec2 uv = vUv;

			if (uCurvature > 0.001) {
				uv = curveRemapUV(uv, uCurvature);
				if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
					fragColor = vec4(0.0, 0.0, 0.0, 1.0);
					return;
				}
			}

			float lightingMask = 1.0;

			if (uScanlineIntensity > 0.001) {
				float scanlineY = uv.y * uScanlineCount;
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

			float mask = clamp(lightingMask, 0.0, 1.0);
			fragColor = vec4(vec3(mask), 1.0);
		}
	`;

	let {
		intensity = 'high',
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

		const profile = SHADER_PROFILES[intensity];
		const flickerStrength = flicker && !reducedMotion ? FLICKER_STRENGTH_DEFAULT : 0;

		glContext.useProgram(program);
		glContext.uniform1f(uniforms.time, reducedMotion ? 0 : timeSeconds);
		glContext.uniform1f(uniforms.scanlineIntensity, profile.scanlineIntensity);
		glContext.uniform1f(uniforms.scanlineCount, profile.scanlineCount);
		glContext.uniform1f(uniforms.adaptiveIntensity, profile.adaptiveIntensity);
		glContext.uniform1f(uniforms.vignetteStrength, profile.vignetteStrength);
		glContext.uniform1f(uniforms.curvature, profile.curvature);
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