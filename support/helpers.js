module.exports.wrap = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};

module.exports.isObject = (value) => typeof value === 'object';