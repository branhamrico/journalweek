'use strict';

module.exports = function(Journal) {
  Journal.observe('access', function(ctx, next) {
    const token = ctx.options && ctx.options.accessToken;
    const userId = token && token.userId;
    const user = userId ? 'user#' + userId : '<anonymous>';

    const modelName = ctx.Model.modelName;
    const scope = ctx.where ? JSON.stringify(ctx.where) : '<all records>';
    console.log('%s: %s accessed %s:%s', new Date(), user, modelName, scope);
    next();
  });

  let beforeSave = (data, token) => {
    let d = new Date();
    data.dateAdded = d;
    data.dateUpdated = d;
    data.writerId = token.userId;
  };

  Journal.observe('before save', (ctx, next) => {
    console.log('accessToken body:', ctx.options.accessToken);
    beforeSave(ctx.instance || ctx.data, ctx.options.accessToken);
    next();
  });
};
