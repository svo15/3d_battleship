"use client"

import { useEffect, useRef} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky, Water } from "three/examples/jsm/Addons.js";


export default function Scene(){
    const mountRef = useRef<any>(null)
    useEffect(() => {
        // scene
        const scene = new THREE.Scene();
        // scene.background=new THREE.Color(0xffffff)

        // perspective camera

        const camera =new THREE.PerspectiveCamera(75,mountRef.current.offsetWidth/mountRef.current.offsetHeight,0.1,1000);

        const sun = new THREE.Vector3();
        
        // render 

        const render =new THREE.WebGLRenderer();
        render.setSize(mountRef.current.offsetWidth,mountRef.current.offsetHeight);
        render.setAnimationLoop(animate)
        mountRef.current.appendChild(render.domElement)

        
        const control = new OrbitControls(camera,render.domElement)
        camera.position.set(0,5,20)
        control.update()

       



        const gridGroup=new THREE.Group()
        gridGroup.rotation.x=Math.PI*0.5
        scene.add(gridGroup) 
        
        const cellSize=1
        const Gridsize=14
        const cells:any=[]

        const geometryTile=new THREE.BoxGeometry(cellSize,0.001)
        const edgeGeometry=new THREE.EdgesGeometry(geometryTile)
        for(let x=0; x<Gridsize;x++){
            for(let y=0;y<Gridsize;y++){
                const material =new THREE.MeshStandardMaterial({color:"white",transparent:true,opacity:0.5})

                const tile=new THREE.Mesh(geometryTile,material)
                const wireFrame=new THREE.LineSegments(edgeGeometry,material)

                tile.position.set(x-Gridsize/2,y-Gridsize/2,-0.1)
                wireFrame.position.set(x-Gridsize/2,y-Gridsize/2,-0.1)

                tile.rotation.x=Math.PI*.5
                wireFrame.rotation.x=Math.PI*.5
                gridGroup.add(wireFrame)
                gridGroup.add(tile)
                cells.push(tile)
                
            }
        }


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
		scene.add( water );

        const sky = new Sky();
		sky.scale.setScalar( 10000 );
		scene.add( sky );

        const parameters = {
            elevation: 2,
            azimuth: -180,
        };

		const pmremGenerator = new THREE.PMREMGenerator( render );
		const sceneEnv = new THREE.Scene();

		let renderTarget:any;

        
        water.material.uniforms['size'].value=5
		function updateSun() {

		    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
			const theta = THREE.MathUtils.degToRad( parameters.azimuth );

			sun.setFromSphericalCoords( 1, phi, theta );

			sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
			water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

			if ( renderTarget !== undefined ) renderTarget.dispose();

			    sceneEnv.add( sky );
				renderTarget = pmremGenerator.fromScene( sceneEnv );
				scene.add( sky );

				scene.environment = renderTarget.texture;

			}

			updateSun();



        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2() 

        const onClick=(event:MouseEvent)=>{

            mouse.x=(event.clientX/window.innerWidth)*2-1
            mouse.y=-(event.clientY/window.innerHeight)*2+1

            raycaster.setFromCamera(mouse,camera)
            const insersects=raycaster.intersectObjects(cells)

            if (insersects.length>0) {
                
                console.log(insersects[0].object.position)
                
            }

        }
        render.domElement.addEventListener("click",onClick)


        function animate(){;
            
            control.update()
            water.material.uniforms[ 'time' ].value += 1.0 / 600.0;
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
    

    return <div  ref={mountRef} className="w-full h-full rounded-2xl" ></div>
}