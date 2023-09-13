class STATUS{
    static readonly ERROR : number = 403;
    static readonly WAIT : number = 199;
    static readonly OK : number = 200;
    static toJSON():Object { 

        return {
            error:this.ERROR, 
            wait:this.WAIT,  
            ok:this.OK,
        }

    }
}

class TYPE{
    static readonly ERROR : number = 403;
    static readonly WARNING : number = 199;
    static readonly OK : number = 200;
    static readonly INFO : number = 201;
    static readonly ACTION : number = 202;
    
    static toJSON():Object { 

        return {
            error:this.ERROR, 
            warning:this.WARNING, 
            info:this.INFO,
            ok:this.OK,
            action: this.ACTION
        }

    }
}

export {STATUS,TYPE}