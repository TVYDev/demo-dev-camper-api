const advancedResults = (model, populate) => async (req, res, next) => {
    // Copy query params
    const reqQuery = { ...req.query };

    // Excluded fields
    const excludedFields = ['select', 'sort', 'limit', 'page'];
    excludedFields.forEach((param) => delete reqQuery[param]);

    // String of query params
    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
    );

    let query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const select = req.query.select.split(',').join(' ');
        query = query.select(select);
    }

    // Sort by
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const pagination = {};

    if (endIndex < totalCount) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    // Reverse populate
    if (populate) {
        query = query.populate(populate);
    }

    const results = await query;

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };

    next();
};

module.exports = advancedResults;
