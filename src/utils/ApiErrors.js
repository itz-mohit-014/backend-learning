class ApiErrors extends Error {
    constructor(
        statusCode,
        message = 'Something went wrong.',
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.errors = errors;
        this.success = false;
        
        // send stack of errors if yes
        if(stack){
            this.stack = stack
        }else{
            // otherwise give instances about the constence which we are talking about.
            Error.captureStackTrace(this, this.constructor)
        }

    }
}


export {ApiErrors}