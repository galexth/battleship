module.exports.wrap = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};