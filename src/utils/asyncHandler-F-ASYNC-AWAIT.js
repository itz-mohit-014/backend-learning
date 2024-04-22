//  second approach to handle via async - await

const asyncHandlerWrapper = (fn) => {
    return async (req, res, next)=>{
        try {
            fn(req, res, next)
        } catch (error) {
            console.log('Error:', error)
            res.status(error.code || 500).json({
                success: false,
                message:error.message, 
                error
            })
            
        }
    }
}

export {asyncHandlerWrapper}