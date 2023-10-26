export class CustomError extends Error{

    protected critical : number;

    constructor(message:string,critical:number=0){
        super(message);
        this.critical=critical
    }
}

