import {SceneObject} from './SceneObject'
import {AnimatedSprite} from './sprite/AnimatedSprite'
import { Vector3 } from '../math/Vector3';
import { GradientCircle } from './GradientCircle';

export class SceneGraph {
    // AND ALL OF THE ANIMATED SPRITES, WHICH ARE NOT STORED
    // SORTED OR IN ANY PARTICULAR ORDER. NOTE THAT ANIMATED SPRITES
    // ARE SCENE OBJECTS
    private animatedSprites : Array<AnimatedSprite>;

    // SET OF VISIBLE OBJECTS, NOTE THAT AT THE MOMENT OUR
    // SCENE GRAPH IS QUITE SIMPLE, SO THIS IS THE SAME AS
    // OUR LIST OF ANIMATED SPRITES
    private visibleSet : Array<SceneObject>;

    private graidentCircles: Array<GradientCircle>;

    public constructor() {
        // DEFAULT CONSTRUCTOR INITIALIZES OUR DATA STRUCTURES
        this.animatedSprites = new Array();
        this.visibleSet = new Array();
        this.graidentCircles = new Array();
    }

    public getTotalSceneNums(): number {
        return this.graidentCircles.length + this.animatedSprites.length
    }

    public getNumSprites() : number {
        return this.animatedSprites.length;
    }

    public addAnimatedSprite(sprite : AnimatedSprite) : void {
        this.animatedSprites.push(sprite);
    }

    public addGradientCircle(cirlce: GradientCircle): void{
        this.graidentCircles.push(cirlce);
    }

    public getObjAt(testX : number, testY : number): SceneObject {
        let k: number = this.visibleSet.length - 1;
        let i: number;
        for (i = k; i >= 0; i --) {
            if (this.visibleSet[i].contains(testX, testY))
                return this.visibleSet[i];
        }
        return null
    }

    public getSpriteAt(testX : number, testY : number) : AnimatedSprite {
        // for (let sprite of this.animatedSprites) {
        //     if (sprite.contains(testX, testY))
        //         return sprite;
        // }
        // return null;
        let k: number = this.animatedSprites.length - 1;
        let i: number;
        for (i = k; i >= 0; i --) {
            if (this.animatedSprites[i].contains(testX, testY))
                return this.animatedSprites[i];
        }
        return null
    }

    public getCircleAt(testX: number, testY: number): GradientCircle {
        // for (let c of this.graidentCircles) {
        //     if (c.contains(testX, testY))
        //         return c
        // }
        // return null;
        let i: number;
        let k  = this.graidentCircles.length - 1;
        for (i= k; i >= 0; i --) {
            if (this.graidentCircles[i].contains(testX, testY))
                return this.graidentCircles[i];
        }
        return null
    }

    public getAnimatedSprites(): Array<AnimatedSprite> {    
        return this.animatedSprites;
    }

    public removeCircle(c: GradientCircle): void {
        let cPos: Vector3 = c.getPosition();
        let newArr = new Array<GradientCircle>();
        if (c != null) {
            for (let s of this.graidentCircles) {
                let pos: Vector3 = s.getPosition();
                if (pos.getX() !== cPos.getX() &&
                    pos.getY() !== cPos.getY()) {
                    newArr.push(s);
                }
            }
        }
        this.graidentCircles = newArr;
    }

    public removeObj(obj: SceneObject): void {
        if (obj instanceof GradientCircle) { 
            this.removeCircle(obj as GradientCircle);
        } else if (obj instanceof AnimatedSprite) {
            this.removeSprite((obj as AnimatedSprite));
        }
    }

    public removeSprite(sprite: AnimatedSprite): void {
        console.log("removing function is called")
        var spritePos: Vector3 = sprite.getPosition();

        let newArr = new Array<AnimatedSprite>();
        if (sprite != null) {
            for (let s of this.animatedSprites) {
                let pos: Vector3 = s.getPosition();
                if (pos.getX() !== spritePos.getX() &&
                    pos.getY() !== spritePos.getY()) {
                    newArr.push(s);
                }
            }
        }
        console.log(`old size: ${this.animatedSprites.length} ... new size:${newArr.length}`);
        console.log(newArr)
        this.animatedSprites = newArr;
    }

    /**
     * update
     * 
     * Called once per frame, this function updates the state of all the objects
     * in the scene.
     * 
     * @param delta The time that has passed since the last time this update
     * funcation was called.
     */
    public update(delta : number) : void {
        for (let sprite of this.animatedSprites) {
            sprite.update(delta);
        }
    }

    public scope() : Array<SceneObject> {
        // CLEAR OUT THE OLD
        this.visibleSet = [];

        // PUT ALL THE SCENE OBJECTS INTO THE VISIBLE SET
        for (let sprite of this.animatedSprites) {
            this.visibleSet.push(sprite);
        }

        for (let c of this.graidentCircles) {
            this.visibleSet.push(c);
        }

        return this.visibleSet;
    }
}