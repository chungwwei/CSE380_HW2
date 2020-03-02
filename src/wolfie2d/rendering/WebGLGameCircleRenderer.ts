import {WebGLGameShader} from './WebGLGameShader'
import {MathUtilities} from '../math/MathUtilities'
import { Matrix } from '../math/Matrix'
import { Vector3 } from '../math/Vector3'
import {AnimatedSprite} from '../scene/sprite/AnimatedSprite'
import {AnimatedSpriteType} from '../scene/sprite/AnimatedSpriteType'
import {WebGLGameTexture} from './WebGLGameTexture'
import {HashTable} from '../data/HashTable'
import { GradientCircle } from '../scene/GradientCircle';

var CircleDefaults = {
    A_POSITION: "a_Position",
    A_VALUETOINTERPOLATE: "a_ValueToInterpolate",
    U_SPRITETRANSFORM: "u_SpriteTransform",
    VAL: "val",
    NUM_VERTICES: 4,
    FLOATS_PER_VERTEX: 2,
    FLOATS_PER_TEXTURE_COORDINATE: 2,
    VERTEX_POSITION_OFFSET: 0,
    TOTAL_BYTES: 20,
    INDEX_OF_FIRST_VERTEX: 0
}

export class WebGLGameCircleRenderer {
    private shader : WebGLGameShader;
    private vertexTexCoordBuffer : WebGLBuffer;
    private valBuffer : WebGLBuffer;

    // WE'LL USE THESE FOR TRANSOFMRING OBJECTS WHEN WE DRAW THEM
    private spriteTransform : Matrix;
    private spriteTranslate : Vector3;
    private spriteRotate : Vector3;
    private spriteScale : Vector3;    

    private webGLAttributeLocations : HashTable<GLuint>;
    private webGLUniformLocations : HashTable<WebGLUniformLocation>;

    public constructor() {}

    public getShader(): WebGLGameShader {
        return this.shader;
    }
    
    public init(webGL : WebGLRenderingContext) : void {
        this.shader = new WebGLGameShader();

        var fragmentShaderSource = [
            'precision highp float;',
            'varying vec2 val;',
            'void main() {',
                'float R = 1.0;',
                'float dist = sqrt(dot(val, val));',
                'float alpha = 1.0;',
                'if (dist > R) {',
                    'discard;',
                '}',
                'gl_FragColor =', 
                'vec4(0.0, 0.0, dist, alpha);',
            '}'
        ].join('\n');

        var vertexShaderSrc = [
            'precision highp float;',
            'attribute vec4 a_Position;',
            'attribute vec2 a_ValueToInterpolate;',
            'varying vec2 val;',    
            'uniform mat4 u_SpriteTransform;',
            
            'void main() {',
                'val = a_ValueToInterpolate;',
            '    gl_Position = u_SpriteTransform',
            '            * a_Position;',
            '}'
        ].join('\n');
        
        this.shader.init(webGL, vertexShaderSrc, fragmentShaderSource);


        let right = 0.5;
        let bottom = -0.5;
        let left = -0.5;
        let top = 0.5;
        // GET THE webGL OBJECT TO USE
        var verticesTexCoords = new Float32Array([
            // 
            right, bottom, 0, 1.0, -1.0,
            right, top, 0, 1.0, 1.0,
            left, top, 0, -1.0, 1.0,
            left, bottom, 0, -1.0, -1.0,
        ]);

        var val = new Float32Array([
            0.5, 0.2
        ])

        // CREATE THE BUFFER ON THE GPU
        this.vertexTexCoordBuffer = webGL.createBuffer();
        this.valBuffer = webGL.createBuffer();

        // BIND THE BUFFER TO BE VERTEX DATA
        webGL.bindBuffer(webGL.ARRAY_BUFFER, this.vertexTexCoordBuffer);
        // webGL.bindBuffer(webGL.ARRAY_BUFFER, this.valBuffer);

        // AND SEND THE DATA TO THE BUFFER WE CREATED ON THE GPU
        webGL.bufferData(webGL.ARRAY_BUFFER, verticesTexCoords, webGL.STATIC_DRAW);
        // webGL.bufferData(webGL.ARRAY_BUFFER, val, webGL.STATIC_DRAW)

        // SETUP THE SHADER ATTRIBUTES AND UNIFORMS
        this.webGLAttributeLocations = {};
        this.webGLUniformLocations = {};
        // this.loadAttributeLocations(webGL, [SpriteDefaults.A_POSITION, SpriteDefaults.A_TEX_COORD]);
        // this.loadUniformLocations(webGL, [SpriteDefaults.U_SPRITE_TRANSFORM, SpriteDefaults.U_SAMPLER, SpriteDefaults.U_TEX_COORD_FACTOR, SpriteDefaults.U_TEX_COORD_SHIFT]);

        this.loadAttributeLocations(webGL, [CircleDefaults.A_POSITION, CircleDefaults.A_VALUETOINTERPOLATE]);
        this.loadUniformLocations(webGL, [CircleDefaults.U_SPRITETRANSFORM]);

        // WE'LL USE THESE FOR TRANSOFMRING OBJECTS WHEN WE DRAW THEM
        this.spriteTransform = new Matrix(4, 4);
        this.spriteTranslate = new Vector3();
        this.spriteRotate = new Vector3();
        this.spriteScale = new Vector3();
    }

    public renderGradientCircle(webGL: WebGLRenderingContext,
                            canvasWidth: number,
                            canvasHeight: number,
                            ) {
        let shaderProgramToUse = this.shader.getProgram();
        webGL.useProgram(shaderProgramToUse);

    }

    public renderGradientCircles(  webGL : WebGLRenderingContext, 
                            canvasWidth : number, 
                            canvasHeight : number, 
                            visibleSet : Array<GradientCircle>) : void {
        // SELECT THE ANIMATED SPRITE RENDERING SHADER PROGRAM FOR USE
        let shaderProgramToUse = this.shader.getProgram();
        webGL.useProgram(shaderProgramToUse);

       // AND THEN RENDER EACH ONE
       for (let circle of visibleSet) {
            this.renderCircle(webGL, canvasWidth, canvasHeight, circle);        
        }
    }

    private loadAttributeLocations(webGL : WebGLRenderingContext, attributeLocationNames : Array<string>) {
        for (var i = 0; i < attributeLocationNames.length; i++) {
            let locationName : string = attributeLocationNames[i];
            let location : GLuint = webGL.getAttribLocation(this.shader.getProgram(), locationName);
            this.webGLAttributeLocations[locationName] = location;
        }
    }

    private loadUniformLocations(webGL : WebGLRenderingContext, uniformLocationNames : Array<string>) {
        for (let i : number = 0; i < uniformLocationNames.length; i++) {
            let locationName : string = uniformLocationNames[i];
            let location : WebGLUniformLocation = webGL.getUniformLocation(this.shader.getProgram(), locationName);
            this.webGLUniformLocations[locationName] = location;
        }
    }

    private renderCircle(   webGL : WebGLRenderingContext, 
                            canvasWidth : number, 
                            canvasHeight : number, 
                            circle : GradientCircle) {

        // // CALCULATE HOW MUCH TO TRANSLATE THE QUAD PER THE SPRITE POSITION
        let spriteWidth : number = circle.getWidth();
        let spriteHeight : number = circle.getHeight();
        console.log("width: " + spriteHeight + " height: " + spriteHeight);
        let spriteXInPixels : number = circle.getPosition().getX() + (spriteWidth/2);
        let spriteYInPixels : number = circle.getPosition().getY() + (spriteHeight/2);
        let spriteXTranslate : number = (spriteXInPixels - (canvasWidth/2))/(canvasWidth/2);
        let spriteYTranslate : number = (spriteYInPixels - (canvasHeight/2))/(canvasHeight/2);
        this.spriteTranslate.setX(spriteXTranslate);
        this.spriteTranslate.setY(-spriteYTranslate);

        // CALCULATE HOW MUCH TO SCALE THE QUAD PER THE SPRITE SIZE
        let defaultWidth : number = canvasWidth/2;
        let defaultHeight : number = canvasHeight/2;
        let scaleX : number = spriteWidth/defaultWidth;
        let scaleY : number = spriteHeight/defaultHeight;
        this.spriteScale.setX(scaleX);
        this.spriteScale.setY(scaleY);

        // @todo - COMBINE THIS WITH THE ROTATE AND SCALE VALUES FROM THE SPRITE
        MathUtilities.identity(this.spriteTransform);
        MathUtilities.model(this.spriteTransform, this.spriteTranslate, this.spriteRotate, this.spriteScale);
        
        // FIGURE OUT THE TEXTURE COORDINATE FACTOR AND SHIFT
        // let texCoordFactorX : number = spriteWidth/texture.width;
        // let texCoordFactorY : number = spriteHeight/texture.height;
        // let spriteLeft : number = sprite.getLeft();
        // let spriteTop : number = sprite.getTop();
        // let texCoordShiftX : number = spriteLeft/texture.width;
        // let texCoordShiftY : number = spriteTop/texture.height;   

        // USE THE ATTRIBUTES
        webGL.bindBuffer(webGL.ARRAY_BUFFER, this.vertexTexCoordBuffer);
        // webGL.bindTexture(webGL.TEXTURE_2D, texture.webGLTexture);

        // HOOK UP THE ATTRIBUTES
        let a_PositionLocation : GLuint = this.webGLAttributeLocations[CircleDefaults.A_POSITION];
        webGL.vertexAttribPointer(
            a_PositionLocation, 
            3, 
            webGL.FLOAT, 
            false, 
            20, 
            0);
        webGL.enableVertexAttribArray(a_PositionLocation);

        let a_ValueToInterpolateLocation: GLuint = this.webGLAttributeLocations[CircleDefaults.A_VALUETOINTERPOLATE];
        webGL.vertexAttribPointer(
            a_ValueToInterpolateLocation, 
            2, 
            webGL.FLOAT, 
            false, 
            20, 
            12);
        webGL.enableVertexAttribArray(a_ValueToInterpolateLocation);


        // USE THE UNIFORMS
        let u_SpriteTransformLocation : WebGLUniformLocation = this.webGLUniformLocations[CircleDefaults.U_SPRITETRANSFORM];
        webGL.uniformMatrix4fv(u_SpriteTransformLocation, false, this.spriteTransform.getData());

        // DRAW THE SPRITE AS A TRIANGLE STRIP USING 4 VERTICES, STARTING AT THE START OF THE ARRAY (index 0)
        webGL.drawArrays(webGL.TRIANGLE_FAN, 0,  CircleDefaults.NUM_VERTICES);
    }
}