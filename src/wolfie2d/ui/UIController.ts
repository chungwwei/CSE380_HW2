/*
 * This provides responses to UI input.
 */
import {AnimatedSprite} from "../scene/sprite/AnimatedSprite"
import {SceneGraph} from "../scene/SceneGraph"

export class UIController {
    private spriteToDrag : AnimatedSprite;
    private scene : SceneGraph;
    private dragOffsetX : number;
    private dragOffsetY : number;

    public constructor() {}

    public init(canvasId : string, initScene : SceneGraph) : void {
        this.spriteToDrag = null;
        this.scene = initScene;
        this.dragOffsetX = -1;
        this.dragOffsetY = -1;

        let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        canvas.addEventListener("mousedown", this.mouseDownHandler);
        canvas.addEventListener("mousemove", this.mouseMoveHandler);
        canvas.addEventListener("mouseup", this.mouseUpHandler);
        canvas.addEventListener("click", this.mouseOneClickHandler);
        canvas.addEventListener("dblclick", this.mouseDoubleClickHandler);
    }

    public mouseDoubleClickHandler = (event: MouseEvent): void => {
        console.log("removing operation");
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        console.log("mousePressX: " + mousePressX);
        console.log("mousePressY: " + mousePressY);
        console.log("sprite: " + sprite);
        if (sprite != null) {
            // Remove sprite
            this.scene.removeSprite(sprite);
        }
    }

    public mouseOneClickHandler = (event: MouseEvent): void => {
    
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        if (sprite == null) {
            // randomly add a new sprite
            console.log("adding sprite operation");
        
        }
    }

    

    public mouseDownHandler = (event : MouseEvent) : void => {
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        console.log("mousePressX: " + mousePressX);
        console.log("mousePressY: " + mousePressY);
        console.log("sprite: " + sprite);
        if (sprite != null) {
            // START DRAGGING IT
            this.spriteToDrag = sprite;
            this.dragOffsetX = sprite.getPosition().getX() - mousePressX;
            this.dragOffsetY = sprite.getPosition().getY() - mousePressY;
        } 
    }
    
    public mouseMoveHandler = (event : MouseEvent) : void => {
        if (this.spriteToDrag != null) {
            this.spriteToDrag.getPosition().set(event.clientX + this.dragOffsetX, 
                                                event.clientY + this.dragOffsetY, 
                                                this.spriteToDrag.getPosition().getZ(), 
                                                this.spriteToDrag.getPosition().getW());
        }
    }

    public mouseUpHandler = (event : MouseEvent) : void => {
        this.spriteToDrag = null;
    }
}