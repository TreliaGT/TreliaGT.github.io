import * as THREE from 'three';

			import Stats from 'three/addons/libs/stats.module.js';

			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
            import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
            import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			let scene, renderer, camera;
			let model, skeleton, clock , animationMixer;
            let controls;

			init();

			function init() {

				const container = document.getElementById( 'container' );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 100 );
				camera.position.set( 1, 2, - 3 );
				camera.lookAt( 0, 1, 0 );

				clock = new THREE.Clock();

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xa0a0a0 );
				scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

				const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
				hemiLight.position.set( 0, 20, 0 );
				scene.add( hemiLight );

				const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
				dirLight.position.set( - 3, 10, - 10 );
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 2;
				dirLight.shadow.camera.bottom = - 2;
				dirLight.shadow.camera.left = - 2;
				dirLight.shadow.camera.right = 2;
				dirLight.shadow.camera.near = 0.1;
				dirLight.shadow.camera.far = 40;
				scene.add( dirLight );

				// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

				// ground

				const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
				mesh.rotation.x = - Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add( mesh );

				const loader = new GLTFLoader();
				loader.load( 'assets/character/character.glb', function ( gltf ) {

                    model = gltf.scene;

                    // Rotate the model
                    model.rotation.y = Math.PI; // Rotate the model 180 degrees around the y-axis
                    // You can adjust the rotation value as needed
                
                    scene.add(model);
                
                    model.traverse(function (object) {
                        if (object.isMesh) object.castShadow = true;
                    });
                
                    skeleton = new THREE.SkeletonHelper(model);
                    skeleton.visible = false;
                    scene.add(skeleton);
                    
                    // Play FBX animation over the GLB model
                    playFBXAnimation();

				} );

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMap.enabled = true;
				container.appendChild( renderer.domElement );

                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
                controls.dampingFactor = 0.25;
                controls.screenSpacePanning = false;
                controls.maxPolarAngle = Math.PI / 2;

				window.addEventListener( 'resize', onWindowResize );

            }
			
            function playFBXAnimation() {
                const fbxLoader = new FBXLoader();
                fbxLoader.load('assets/animations/Standing Using Touchscreen Tablet.fbx', function (object) {
                    const mixer = new THREE.AnimationMixer(model);
                    const animationAction = mixer.clipAction(object.animations[0]); // Assuming the first animation
                    animationAction.play();
            
                    animationMixer = mixer;
                });
            }

            

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				// Render loop

				requestAnimationFrame( animate );

                if (animationMixer) {
                    animationMixer.update(0.016); // Update the animation mixer with a fixed time delta
                }
				 controls.update(); // Update the OrbitControls


				renderer.render( scene, camera );

			}

            animate();