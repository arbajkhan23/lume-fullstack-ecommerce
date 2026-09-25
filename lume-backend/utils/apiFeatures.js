/**
 * Chainable query helper for search / filter / sort / pagination
 * used across product, order and customer list endpoints.
 *
 * Usage:
 *   const features = new ApiFeatures(Product.find(), req.query)
 *     .search(['name', 'description'])
 *     .filter()
 *     .sort()
 *     .paginate();
 *   const results = await features.query;
 *   const meta = await features.getMeta(Product);
 */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filters = {};
  }

  search(fields = []) {
    if (this.queryString.q && fields.length) {
      const regex = new RegExp(this.queryString.q, 'i');
      this.query = this.query.find({ $or: fields.map((f) => ({ [f]: regex })) });
    }
    return this;
  }

  filter(allowedFields = []) {
    const queryObj = { ...this.queryString };
    const excluded = ['q', 'sort', 'page', 'limit', 'fields'];
    excluded.forEach((el) => delete queryObj[el]);

    const applied = {};
    Object.keys(queryObj).forEach((key) => {
      if (!allowedFields.length || allowedFields.includes(key)) {
        applied[key] = queryObj[key];
      }
    });

    let queryStr = JSON.stringify(applied);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.filters = JSON.parse(queryStr);
    this.query = this.query.find(this.filters);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    const skip = (page - 1) * limit;
    this.page = page;
    this.limit = limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  async getMeta(Model) {
    const total = await Model.countDocuments(this.filters);
    return {
      total,
      page: this.page || 1,
      limit: this.limit || 20,
      totalPages: Math.ceil(total / (this.limit || 20)),
    };
  }
}

module.exports = ApiFeatures;
