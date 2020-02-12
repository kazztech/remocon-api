require("../router/v1/commons/formats");

module.exports = errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (!err.statusCode) err = boom.boomify(err);

    if (err.isServer) {
        // 500err
    }

    // リクエストエラー(パラメータ等)
    if (err.statusCode === 400) {
        return res.json(responsePropsFormat(true, "リクエストエラー", null));
    }

    return res.json(responsePropsFormat(true, `ステータス: ${err.statusCode}`, null));
}