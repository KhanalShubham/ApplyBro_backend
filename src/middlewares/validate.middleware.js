import Joi from 'joi';


export const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = {
      ...req.body,
      ...req.query,
      ...req.params
    };
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove unknown fields
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors
      });
    }
    
    // Replace request data with validated and sanitized data
    req.body = value.body || req.body;
    req.query = value.query || req.query;
    req.params = value.params || req.params;
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  // Auth schemas
  signup: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      country: Joi.string().optional()
    })
  }),
  
  login: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    })
  }),
  
  refreshToken: Joi.object({
    body: Joi.object({
      refreshToken: Joi.string().required()
    })
  }),
  
  // Scholarship schemas
  createScholarship: Joi.object({
    body: Joi.object({
      title: Joi.string().min(5).max(200).required(),
      description: Joi.string().min(10).required(),
      country: Joi.string().required(),
      countryFlag: Joi.string().optional(),
      level: Joi.string().valid('+2', 'Bachelor', 'Master', 'PhD').required(),
      fields: Joi.array().items(Joi.string()).optional(),
      deadline: Joi.date().greater('now').required(),
      eligibility: Joi.object({
        minGPA: Joi.number().min(0).max(4.0).optional(),
        requiredDocs: Joi.array().items(Joi.string()).optional(),
        ageLimit: Joi.number().optional(),
        nationality: Joi.array().items(Joi.string()).optional()
      }).optional(),
      benefits: Joi.string().optional(),
      amount: Joi.string().optional(),
      externalLink: Joi.string().uri().optional(),
      status: Joi.string().valid('open', 'upcoming', 'closed').optional()
    })
  }),
  
  updateScholarship: Joi.object({
    params: Joi.object({
      id: Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
      title: Joi.string().min(5).max(200).optional(),
      description: Joi.string().min(10).optional(),
      country: Joi.string().optional(),
      level: Joi.string().valid('+2', 'Bachelor', 'Master', 'PhD').optional(),
      deadline: Joi.date().optional(),
      status: Joi.string().valid('open', 'upcoming', 'closed').optional()
    }).min(1) // At least one field required for update
  }),
  
  // Post schemas
  createPost: Joi.object({
    body: Joi.object({
      title: Joi.string().min(5).max(200).required(),
      body: Joi.string().min(10).max(5000).required(),
      imageUrl: Joi.string().uri().optional().allow(''),
      category: Joi.string().valid('Success Story', 'Tips', 'Guidance', 'Other').optional()
    })
  }),
  
  updatePost: Joi.object({
    params: Joi.object({
      id: Joi.string().hex().length(24).required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'approved', 'declined').required(),
      adminNote: Joi.string().max(500).optional().allow('')
    })
  }),
  
  // User schemas
  updateProfile: Joi.object({
    body: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      profile: Joi.object({
        educationLevel: Joi.string().valid('+2', 'Bachelor', 'Master', 'PhD').optional(),
        major: Joi.string().max(100).optional(),
        gpa: Joi.number().min(0).max(4.0).optional(),
        preferredCountries: Joi.array().items(Joi.string()).optional(),
        country: Joi.string().optional()
      }).optional()
    }).min(1)
  }),
  
  // Pagination schema
  pagination: Joi.object({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
      sort: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').default('desc')
    })
  })
};






