import { AnimatedSpriteType } from './../scene/sprite/AnimatedSpriteType';
import { ResourceManager } from './../files/ResourceManager';


/*
 * This provides responses to UI input.
 */
import {AnimatedSprite} from "../scene/sprite/AnimatedSprite"
import {SceneGraph} from "../scene/SceneGraph"
import { TextToRender, TextRenderer } from './../rendering/TextRenderer';
import { WebGLGameRenderingSystem } from './../rendering/WebGLGameRenderingSystem';
import { game } from '../../animated_sprite_demo/AnimatedSpriteDemo';




export class UIController {
    private spriteToDrag : AnimatedSprite;
    private scene : SceneGraph;
    private dragOffsetX : number;
    private dragOffsetY : number;
    private renderingSystem : WebGLGameRenderingSystem;
    private detail: TextToRender;
    private mouseOverSprite: AnimatedSprite;

    public constructor() {}

    public init(canvasId : string, initScene : SceneGraph,
            renderingSystem: WebGLGameRenderingSystem
        ) : void {
        this.spriteToDrag = null;
        this.scene = initScene;
        this.dragOffsetX = -1;
        this.dragOffsetY = -1;
        this.renderingSystem = renderingSystem;

        let canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        canvas.addEventListener("mousedown", this.mouseDownHandler);
        canvas.addEventListener("mousemove", this.mouseMoveHandler);
        canvas.addEventListener("mouseup", this.mouseUpHandler);
        canvas.addEventListener("click", this.mouseOneClickHandler);
        canvas.addEventListener("dblclick", this.mouseDoubleClickHandler);
        canvas.addEventListener("mousemove", this.mouseOverHandler);
    }

    public getMouseOverSprite(): AnimatedSprite {
        return this.mouseOverSprite;
    }

    public mouseOverHandler = (event: MouseEvent): void => {
        console.log("MOUSING OVER YO");
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        var textRenderer: TextRenderer = this.renderingSystem.getTextRenderer();
        
        if (sprite != null) {
            console.log("Mousing over the sprite");
            this.mouseOverSprite = sprite;
        } else {
            this.mouseOverSprite = null;
        }
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
        const DEMO_SPRITE_TYPES : string[] = [
            'resources/animated_sprites/RedCircleMan.json',
            'resources/animated_sprites/MultiColorBlock.json'
        ];
        const DEMO_SPRITE_STATES = {
            FORWARD_STATE: 'FORWARD',
            REVERSE_STATE: 'REVERSE'
        };
        let mousePressX : number = event.clientX;
        let mousePressY : number = event.clientY;
        let sprite : AnimatedSprite = this.scene.getSpriteAt(mousePressX, mousePressY);
        if (sprite == null) {

            // randomly add a new sprite
            let max = 1;
            let min = 0;
            let i  = Math.floor(Math.random() * (max - min + 1)) + min;
            console.log("adding sprite operation");
            let spriteTypeToUse : string = DEMO_SPRITE_TYPES[i];
            let ResourceManager: ResourceManager = game.getResourceManager();
            let animatedSpriteType : AnimatedSpriteType = ResourceManager.getAnimatedSpriteTypeById(spriteTypeToUse);
            let spriteToAdd : AnimatedSprite = new AnimatedSprite(animatedSpriteType, DEMO_SPRITE_STATES.FORWARD_STATE);
            spriteToAdd.getPosition().set(mousePressX, mousePressY, 0.0, 1.0);
            this.scene.addAnimatedSprite(spriteToAdd);
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