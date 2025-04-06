"use client"

import { useEffect, useRef} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Tile extends THREE.Mesh{
    _active: boolean;
    _cubeSize:number;
    constructor() {
        super()
        this._cubeSize=1
        this._active=false
        this.geometry = new THREE.BoxGeometry(this._cubeSize,0.1,this._cubeSize)
        this.material = new THREE.MeshStandardMaterial({ color: "white"})
        
        
        this.position.set(this._cubeSize+1,this._cubeSize/2,0)
    }
    set cubeSize(newsize:number){
        this._cubeSize=newsize

        this.geometry.dispose()
        this.geometry = new THREE.BoxGeometry(this._cubeSize,this._cubeSize,this._cubeSize)
        this.position.set(this._cubeSize+1,this._cubeSize/2,0)
    
    }
    onClick(e:any){
        this._active=!this._active;
        this.scale.setScalar(this._cubeSize * (this._active ? 1.5 : 1))
    }
}

export default function Scene(){
    const mountRef = useRef<any>(null)
    useEffect(() => {
        // scene
        const scene = new THREE.Scene();
        // scene.background=new THREE.Color(0xffffff)

        // perspective camera

        const camera =new THREE.PerspectiveCamera(75,mountRef.current.offsetWidth/mountRef.current.offsetHeight,0.1,1000);


        
        // render 

        const render =new THREE.WebGLRenderer();
        render.setSize(mountRef.current.offsetWidth,mountRef.current.offsetHeight);
        render.setAnimationLoop(animate)
        mountRef.current.appendChild(render.domElement)


        // texture creating
        const planesize= 400
        
        const texturloader=new THREE.TextureLoader()
        const texture=texturloader.load('/checker.png')
        texture.wrapS=THREE.RepeatWrapping
        texture.wrapT=THREE.RepeatWrapping
        texture.magFilter=THREE.NearestFilter
        texture.colorSpace=THREE.SRGBColorSpace
        texture.repeat.set(planesize/2,planesize/2)

        const planeGeo=new THREE.PlaneGeometry(planesize,planesize)
        const planeMat=new THREE.MeshPhongMaterial({
            map: texture,
            side:THREE.DoubleSide
        })

        const planeMesh=new THREE.Mesh(planeGeo,planeMat)
        planeMesh.rotation.x=Math.PI * -.5;
        scene.add(planeMesh)
        
        
        // light 
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(2, 2, 5);
        scene.add(light);

        
        const control = new OrbitControls(camera,render.domElement)

        camera.position.set(5,5,5)
        control.update()

        const cellSize=1
        const Gridsize=14
        const cells:any=[]



        const gridGroup=new THREE.Group()
        gridGroup.rotation.x=Math.PI*0.5
        scene.add(gridGroup)

        const geometryTile=new THREE.BoxGeometry(cellSize,0.001)
        const edgeGeometry=new THREE.EdgesGeometry(geometryTile)
        for(let x=0; x<Gridsize;x++){
            for(let y=0;y<Gridsize;y++){
                const material =new THREE.MeshStandardMaterial({color:"white"})

                const tile=new THREE.Mesh(geometryTile,material)
                const wireFrame=new THREE.LineSegments(edgeGeometry,material)

                tile.position.set(x-Gridsize/2,y-Gridsize/2,0)
                wireFrame.position.set(x-Gridsize/2,y-Gridsize/2,0)

                tile.rotation.x=Math.PI*.5
                wireFrame.rotation.x=Math.PI*.5
                gridGroup.add(wireFrame)
                gridGroup.add(tile)
                cells.push(tile)
                
            }
        }



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