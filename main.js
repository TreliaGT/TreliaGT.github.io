import * as THREE from 'three';

			import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
            import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
            import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			let scene, renderer, camera;
			let model, skeleton, clock , animationMixer;
            let controls;
		
	
			init();

			function init() {

				const container = document.getElementById('container');

				camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
				camera.position.set(-2, 2, -3);
				camera.lookAt(0, 1, 0);
			
				clock = new THREE.Clock();
			
				scene = new THREE.Scene();
			
				const hemiLight = new THREE.HemisphereLight(0xADD8E6, 0xf9f1e3, 3);
				hemiLight.position.set(0, 20, 0);
				scene.add(hemiLight);
			
				const dirLight = new THREE.DirectionalLight(0xffffff, 3);
				dirLight.position.set(-3, 10, -10);
				dirLight.castShadow = true;
				dirLight.shadow.camera.top = 2;
				dirLight.shadow.camera.bottom = -2;
				dirLight.shadow.camera.left = -2;
				dirLight.shadow.camera.right = 2;
				dirLight.shadow.camera.near = 0.1;
				dirLight.shadow.camera.far = 40;
				scene.add(dirLight);
			
				// ground
				const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }));
				mesh.rotation.x = -Math.PI / 2;
				mesh.receiveShadow = true;
				scene.add(mesh);

				const loader = new GLTFLoader();
				loader.load( 'assets/models/character.glb', function ( gltf ) {

                    model = gltf.scene;

                    // Rotate the model
                    model.rotation.y = Math.PI; // Rotate the model 180 degrees around the y-axis
                    // You can adjust the rotation value as needed
					model.position.set(-1, -0.5, 0);
                    scene.add(model);
                
                    model.traverse(function (object) {
                        if (object.isMesh) object.castShadow = true;
                    });

					// model.traverse(function (object) {
					// 	if (object.isBone) {
					// 		console.log('Bone Name:', object.name);
					// 	}
					// });
                
                    skeleton = new THREE.SkeletonHelper(model);
                    skeleton.visible = false;
                    scene.add(skeleton);
                    
                    // Play FBX animation over the GLB model
                     playFBXAnimation();

					loader.load('assets/models/phone.glb', function (phoneModel) {
						const phone = phoneModel.scene;
					
					  // Adjust the position to move the phone more to the left
						phone.position.set(-0.08, 0.14, 0.17); // Move the phone 0.1 units to the left along the x-axis

						// Adjust the rotation to flip the phone around
						phone.rotation.set(Math.PI, 0, 0.5); // Flip the phone around 180 degrees along the x-axis

						// Adjust the scale of the phone
						phone.scale.set(0.04, 0.03, 0.03); // Set scale to 3% of its original size

						// Assuming 'handBone' is the bone in the character's skeleton representing the hand
						const handBoneName = 'LeftHand';
						const handBone = skeleton.bones.find(bone => bone.name === handBoneName);
					
						if (handBone) {
							// Make the phone a child of the hand bone
							handBone.add(phone);
						} else {
							console.error("Hand bone not found!");
						}
					});

				} );
				

				renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);
				renderer.shadowMap.enabled = true;


				container.appendChild(renderer.domElement);
                controls = new OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
                controls.dampingFactor = 0.25;
                controls.screenSpacePanning = false;
                controls.maxPolarAngle = Math.PI / 2;

				window.addEventListener( 'resize', onWindowResize );

            }

			
            function playFBXAnimation() {
                const fbxLoader = new FBXLoader();
                fbxLoader.load('assets/animations/Standing Using Touchscreen Tablet (4).fbx', function (object) {
                    const mixer = new THREE.AnimationMixer(model);
                    const animationAction = mixer.clipAction(object.animations[0]); // Assuming the first animation
                    animationAction.play();
            
                    animationMixer = mixer;
                });
            }

		// Function to play falling animation
		function playFallingAnimation(){
			// Model is loaded, continue with animation
			const fbxLoader = new FBXLoader();
			fbxLoader.load('assets/animations/Falling.fbx', function (object) {
				const mixer = new THREE.AnimationMixer(model);
				const animationAction = mixer.clipAction(object.animations[0]);
				animationAction.play();

				animationMixer = mixer;
			});
		}


		function playIDEAnimation(){
			// Model is loaded, continue with animation
			const fbxLoader = new FBXLoader();
			fbxLoader.load('assets/animations/Standing Idle.fbx', function (object) {
				const mixer = new THREE.AnimationMixer(model);
				const animationAction = mixer.clipAction(object.animations[0]);
				animationAction.play();

				animationMixer = mixer;
			});
		}

		const sections = document.querySelectorAll('section');

		// Options for the Intersection Observer
		const options = {
		  root: null, // Use the viewport as the root
		  rootMargin: '0px', // No margin
		  threshold: 0.5 // Trigger when half of the section is visible
		};
		
		// Callback function when section intersects with viewport
		const callback = (entries, observer) => {
		  entries.forEach(entry => {
			if (entry.isIntersecting) {
			  const sectionId = entry.target.id;
			  switch (sectionId) {
				case 'Intro':
				  // Perform animation for intro section
				  playFBXAnimation();
				  break;
				case 'skills':
					playFallingAnimation();
					break;
				case 'contact':
				  // Perform animation for contact section
				  playIDEAnimation();
				  break;
				// Add cases for other sections as needed
			  }
			}
		  });
		};
		
		// Create a new Intersection Observer
		const observer = new IntersectionObserver(callback, options);
		
		// Observe each section
		sections.forEach(section => {
		  observer.observe(section);
		});


			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight);
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