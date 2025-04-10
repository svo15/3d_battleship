"use client"

import { useEffect, useRef} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls, GLTFLoader, Sky, Water } from "three/examples/jsm/Addons.js";
import { Grid,Cube } from "./classes";
import { isAssetError } from "next/dist/client/route-loader";


export default function Scene(){
    const mountRef = useRef<any>(null)

    const scene = new THREE.Scene();

    const sun = new THREE.Vector3()
    
    function WaterAndSky(){
        const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

		const water = new Water(waterGeometry,
		{
        	textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load( '/waternormals.jpg', function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			} ),
			sunDirection: new THREE.Vector3(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: 3.7,
			fog: scene.fog !== undefined
		});

		water.rotation.x = - Math.PI / 2;
        water.userData.water=true
		scene.add( water );

        const sky = new Sky();
		sky.scale.setScalar( 10000 );
		scene.add( sky );
    }

    useEffect(() => {

        // perspective camera

        const camera =new THREE.PerspectiveCamera(75,mountRef.current.offsetWidth/mountRef.current.offsetHeight,0.1,1000);
        
        // render 
        const render =new THREE.WebGLRenderer();
        
        render.setSize(mountRef.current.offsetWidth,mountRef.current.offsetHeight);
        render.setAnimationLoop(animate)
        mountRef.current.appendChild(render.domElement)

        
        const control = new OrbitControls(camera,render.domElement)
        camera.position.set(0,5,10)
        control.update()

        const grid=new Grid(scene)
        grid.gridGroup.rotation.x=Math.PI*0.5
        scene.add(grid.gridGroup)

    

        
        function createWater(){
                const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );            
                const water = new Water(waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new THREE.TextureLoader().load( '/waternormals.jpg', function ( texture ) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                    } ),
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 3.7,
                    fog: scene.fog !== undefined
                });
        
                water.rotation.x = - Math.PI / 2;
                water.userData.water=true
                water.material.uniforms['size'].value=5
                scene.add( water );
                
                return water;
        }
        function createSky(){
            const sky = new Sky();
		    sky.scale.setScalar( 10000 );
		    scene.add( sky );

            return sky;
        }


		const water = createWater()
        const sky=createSky()

		
        
        const parameters = {
            elevation: 2,
            azimuth: -180,
        };

		const pmremGenerator = new THREE.PMREMGenerator( render );
		const sceneEnv = new THREE.Scene();

		let renderTarget:any;

        
        
		function updateSun() {

		    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
			const theta = THREE.MathUtils.degToRad( parameters.azimuth );

			sun.setFromSphericalCoords( 10, phi, theta );

			sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
			water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

			if ( renderTarget !== undefined ) renderTarget.dispose();

			    sceneEnv.add( sky );
				renderTarget = pmremGenerator.fromScene( sceneEnv );
				scene.add( sky );

				scene.environment = renderTarget.texture;

		}


        const raycaster = new THREE.Raycaster()
        const Mouse = new THREE.Vector2() 

        const MoveMouse=new THREE.Vector2

        let draggable:THREE.Object3D

        const gltfloader=new GLTFLoader()

        let root:any;

        gltfloader.load('/3dmodels/ship/scene.gltf',(gltf)=>{
            root=gltf.scene
            root.scale.set(10,10,10)
            root.position.set(0,0.5,0)
            root.userData.draggable=true
            scene.add(root) 
        })


        
        window.addEventListener("click",event=>{
            if (draggable) {
                draggable=null as any
                
                return;
            }
            Mouse.x=(event.clientX/window.innerWidth)*2-1
            Mouse.y=-(event.clientY/window.innerHeight)*2+1
            
            raycaster.setFromCamera(Mouse,camera)
            const intersects=raycaster.intersectObjects(scene.children,true)


            if (intersects.length > 0) {
                let selectedObject = intersects[0].object;
        
                // Check if the object is part of a group
                while (selectedObject.parent && !(selectedObject.parent instanceof THREE.Scene)) {
                    selectedObject = selectedObject.parent; // Move up the hierarchy to find the group
                }
        
                if (selectedObject.userData.draggable) {
                    draggable = selectedObject;
                }
            }
            

        })
        
        window.addEventListener('mousemove',event=>{
            
            MoveMouse.x=(event.clientX/window.innerWidth)*2-1
            MoveMouse.y=-(event.clientY/window.innerHeight)*2+1
        })
        function objectMove(){
            if (draggable!=null) {
                raycaster.setFromCamera(MoveMouse,camera)
                const intersect =raycaster.intersectObjects(scene.children,true)
                if (intersect.length>0) {
                    for(let o of intersect){
                        if (o.object.userData.water) {
                            draggable.position.x=o.point.x
                            draggable.position.z=o.point.z 
                        }
                        
                    }
                }
            }
            
        }


        function animate(){;
            
            control.update()
            water.material.uniforms[ 'time' ].value += 1.0 / 600.0;
            objectMove();
            updateSun();
            parameters.azimuth+=10.0/60.0
            render.render(scene,camera);
        }
        animate()

        const handleSize=()=>{
            camera.aspect=mountRef.current.offsetWidth/mountRef.current.offsetHeight
            camera.updateProjectionMatrix()
            render.setSize(mountRef.current.offsetWidth,mountRef.current.offsetHeight)
        }
        window.addEventListener('resize',handleSize)

        return ()=>{
            mountRef.current.removeChild(render.domElement)
            window.removeEventListener("resize",handleSize)
            mountRef.current?.removeChild(render.domElement);
        }
    }, [])
    

    return <div  ref={mountRef} className="w-full h-full" ></div>
}