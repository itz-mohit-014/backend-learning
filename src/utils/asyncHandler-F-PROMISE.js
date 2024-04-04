const asyncHandler = (reqHandler) => {
    return (req, res, next)=>{
        Promise.resolve(reqHandler(req, res, next))
        .catch((err)=>{
            console.log('Got Error:', err)
            next(err)
        })
    }
}


export {asyncHandler}

