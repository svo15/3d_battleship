import * as THREE from "three"

export class Grid{
    scene:THREE.Scene
    Gridsize:number
    cellSize:number
    cells:any
    gridGroup:THREE.Group<THREE.Object3DEventMap>
    constructor(scene: any,Gridsize=14,cellSize=1){
        this.scene=scene;
        this.Gridsize=Gridsize;
        this.cellSize=cellSize;
        this.cells=[]
        this.gridGroup=new THREE.Group()
        this.initGrid();
        this.scene.add(this.gridGroup)

    }
    initGrid(){
        const geometryTile=new THREE.BoxGeometry(this.cellSize,0.001)
        const edgeGeometry=new THREE.EdgesGeometry(geometryTile)
        for(let x=0; x<this.Gridsize;x++){
            for(let y=0;y<this.Gridsize;y++){
                const material =new THREE.MeshStandardMaterial({color:"white",transparent:true,opacity:0.5})

                const tile=new THREE.Mesh(geometryTile,material)
                const wireFrame=new THREE.LineSegments(edgeGeometry,material)

                tile.position.set(x-this.Gridsize/2,y-this.Gridsize/2,-0.1)
                wireFrame.position.set(x-this.Gridsize/2,y-this.Gridsize/2,-0.1)

                tile.rotation.x=Math.PI*.5
                wireFrame.rotation.x=Math.PI*.5
                this.gridGroup.add(wireFrame)
                this.gridGroup.add(tile)
                this.cells.push(tile)
                
            }
        }

    }
}