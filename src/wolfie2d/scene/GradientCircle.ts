import { SceneObject } from "./SceneObject";


export class GradientCircle extends SceneObject {

    private width: number;
    private height: number;
    private r: number;
    private g: number;
    private b: number;

    private radius: number

    public constructor(width: number, height: number) {
        super();
        this.width = width
        this.height = height
        this.radius = 20;
    }

    public getWidth(): number {
        return this.width;
    }

    
    public getHeight(): number {
        return this.height;
    }


    public contains(testX : number, testY : number) : boolean {
        let spriteWidth = this.getWidth();
        let spriteHeight = this.getHeight();
        let spriteLeft = this.getPosition().getX();
        let spriteRight = this.getPosition().getX() + spriteWidth;
        let spriteTop = this.getPosition().getY();
        let spriteBottom = this.getPosition().getY() + spriteHeight;
        if (    (testX < spriteLeft)
            ||  (spriteRight < testX)
            ||  (testY < spriteTop)
            ||  (spriteBottom < testY)) {
                return false;
        }
        else {
            return true;
        }
    }

    
}

