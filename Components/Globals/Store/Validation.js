// validation.js - Global Validation Service
// import languageService from './languages';
// import languageService from "./Lang";
import languageService from "./Lang";
class ValidationService {
  constructor() {
    this.rules = {};
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Phone number validation (Saudi format)
  isValidSaudiPhone(phone) {
    // Saudi phone numbers: +966XXXXXXXXX or 05XXXXXXXX or 966XXXXXXXXX
    const saudiPhoneRegex = /^(\+966|966|05)[0-9]{8,9}$/;
    return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Iqama number validation (10 digits)
  isValidIqama(iqama) {
    const iqamaRegex = /^[0-9]{10}$/;
    return iqamaRegex.test(iqama);
  }

  // Password strength validation
  isValidPassword(password) {
    return {
      isValid: password.length >= 6,
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  // Required field validation
  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  // Minimum length validation
  hasMinLength(value, minLength) {
    return value && value.toString().length >= minLength;
  }

  // Maximum length validation
  hasMaxLength(value, maxLength) {
    return !value || value.toString().length <= maxLength;
  }

  // Numeric validation
  isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  // Positive number validation
  isPositiveNumber(value) {
    return this.isNumeric(value) && parseFloat(value) > 0;
  }

  // Date validation
  isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  // Future date validation
  isFutureDate(date) {
    return this.isValidDate(date) && date > new Date();
  }

  // Past date validation
  isPastDate(date) {
    return this.isValidDate(date) && date < new Date();
  }

  // Registration form validation
  validateRegistrationForm(formData) {
    const errors = {};
    const t = languageService.t.bind(languageService);

    // First Name validation
    if (!this.isRequired(formData.first_name)) {
      errors.first_name = t('firstNameRequired');
    } else if (!this.hasMinLength(formData.first_name, 2)) {
      errors.first_name = t('First name must be at least 2 characters');
    } else if (!this.hasMaxLength(formData.first_name, 50)) {
      errors.first_name = t('First name must not exceed 50 characters');
    }

    // Last Name validation
    if (!this.isRequired(formData.last_name)) {
      errors.last_name = t('lastNameRequired');
    } else if (!this.hasMinLength(formData.last_name, 2)) {
      errors.last_name = t('Last name must be at least 2 characters');
    } else if (!this.hasMaxLength(formData.last_name, 50)) {
      errors.last_name = t('Last name must not exceed 50 characters');
    }

    // Email validation
    if (!this.isRequired(formData.email)) {
      errors.email = t('emailRequired');
    } else if (!this.isValidEmail(formData.email)) {
      errors.email = t('invalidEmail');
    }

    // Iqama validation
    if (!this.isRequired(formData.iqama_no)) {
      errors.iqama_no = t('iqamaRequired');
    } else if (!this.isValidIqama(formData.iqama_no)) {
      errors.iqama_no = t('invalidIqama');
    }

    // Phone validation (if provided)
    if (formData.phone && !this.isValidSaudiPhone(formData.phone)) {
      errors.phone = t('invalidPhone');
    }

    // Date of Birth validation
    if (!this.isValidDate(formData.dob)) {
      errors.dob = t('Invalid date of birth');
    } else if (!this.isPastDate(formData.dob)) {
      errors.dob = t('Date of birth must be in the past');
    }

    // Role validation
    if (!this.isRequired(formData.role_id)) {
      errors.role_id = t('Role is required');
    } else if (![1, 2, 3].includes(parseInt(formData.role_id))) {
      errors.role_id = t('Invalid role selected');
    }

    // Password validation
    if (!this.isRequired(formData.password)) {
      errors.password = t('passwordRequired');
    } else {
      const passwordValidation = this.isValidPassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = t('passwordMinLength');
      }
    }

    // Password confirmation validation
    if (!this.isRequired(formData.password_confirmation)) {
      errors.password_confirmation = t('Password confirmation is required');
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = t('passwordsNotMatch');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Login form validation
  validateLoginForm(formData) {
    const errors = {};
    const t = languageService.t.bind(languageService);

    // Email validation
    if (!this.isRequired(formData.email)) {
      errors.email = t('emailRequired');
    } else if (!this.isValidEmail(formData.email)) {
      errors.email = t('invalidEmail');
    }

    // Password validation
    if (!this.isRequired(formData.password)) {
      errors.password = t('passwordRequired');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Customer form validation
  validateCustomerForm(formData) {
    const errors = {};
    const t = languageService.t.bind(languageService);

    // Customer name validation
    if (!this.isRequired(formData.name)) {
      errors.name = t('Customer name is required');
    } else if (!this.hasMinLength(formData.name, 2)) {
      errors.name = t('Customer name must be at least 2 characters');
    }

    // Phone validation
    if (!this.isRequired(formData.phone)) {
      errors.phone = t('phoneRequired');
    } else if (!this.isValidSaudiPhone(formData.phone)) {
      errors.phone = t('invalidPhone');
    }

    // Email validation (optional)
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.email = t('invalidEmail');
    }

    // VAT number validation (optional)
    if (formData.vat_number && formData.vat_number.length !== 15) {
      errors.vat_number = t('VAT number must be 15 digits');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Product form validation
  validateProductForm(formData) {
    const errors = {};
    const t = languageService.t.bind(languageService);

    // Product name validation
    if (!this.isRequired(formData.name)) {
      errors.name = t('Product name is required');
    }

    // Price validation
    if (!this.isRequired(formData.price)) {
      errors.price = t('Price is required');
    } else if (!this.isPositiveNumber(formData.price)) {
      errors.price = t('Price must be a positive number');
    }

    // Stock validation
    if (formData.stock !== undefined && formData.stock !== null) {
      if (!this.isNumeric(formData.stock)) {
        errors.stock = t('Stock must be a number');
      } else if (parseFloat(formData.stock) < 0) {
        errors.stock = t('Stock cannot be negative');
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Sales form validation
  validateSalesForm(formData) {
    const errors = {};
    const t = languageService.t.bind(languageService);

    // Customer validation
    if (!this.isRequired(formData.customer_id)) {
      errors.customer_id = t('Customer is required');
    }

    // Items validation
    if (!formData.items || !Array.isArray(formData.items) || formData.items.length === 0) {
      errors.items = t('At least one item is required');
    } else {
      formData.items.forEach((item, index) => {
        if (!this.isRequired(item.product_id)) {
          errors[`items.${index}.product_id`] = t('Product is required');
        }
        if (!this.isRequired(item.quantity) || !this.isPositiveNumber(item.quantity)) {
          errors[`items.${index}.quantity`] = t('Valid quantity is required');
        }
        if (!this.isRequired(item.price) || !this.isPositiveNumber(item.price)) {
          errors[`items.${index}.price`] = t('Valid price is required');
        }
      });
    }

    // Payment method validation
    if (!this.isRequired(formData.payment_method)) {
      errors.payment_method = t('Payment method is required');
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // General form validation helper
  validateForm(formData, rules) {
    const errors = {};

    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const fieldValue = formData[field];

      fieldRules.forEach(rule => {
        if (rule.type === 'required' && !this.isRequired(fieldValue)) {
          errors[field] = rule.message;
        } else if (rule.type === 'email' && fieldValue && !this.isValidEmail(fieldValue)) {
          errors[field] = rule.message;
        } else if (rule.type === 'minLength' && fieldValue && !this.hasMinLength(fieldValue, rule.value)) {
          errors[field] = rule.message;
        } else if (rule.type === 'maxLength' && fieldValue && !this.hasMaxLength(fieldValue, rule.value)) {
          errors[field] = rule.message;
        } else if (rule.type === 'numeric' && fieldValue && !this.isNumeric(fieldValue)) {
          errors[field] = rule.message;
        } else if (rule.type === 'positive' && fieldValue && !this.isPositiveNumber(fieldValue)) {
          errors[field] = rule.message;
        } else if (rule.type === 'phone' && fieldValue && !this.isValidSaudiPhone(fieldValue)) {
          errors[field] = rule.message;
        } else if (rule.type === 'iqama' && fieldValue && !this.isValidIqama(fieldValue)) {
          errors[field] = rule.message;
        }
      });
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Real-time validation for individual fields
  validateField(fieldName, value, rules) {
    const fieldRules = rules[fieldName];
    if (!fieldRules) return { isValid: true, error: null };

    for (const rule of fieldRules) {
      if (rule.type === 'required' && !this.isRequired(value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'email' && value && !this.isValidEmail(value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'minLength' && value && !this.hasMinLength(value, rule.value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'maxLength' && value && !this.hasMaxLength(value, rule.value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'numeric' && value && !this.isNumeric(value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'positive' && value && !this.isPositiveNumber(value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'phone' && value && !this.isValidSaudiPhone(value)) {
        return { isValid: false, error: rule.message };
      } else if (rule.type === 'iqama' && value && !this.isValidIqama(value)) {
        return { isValid: false, error: rule.message };
      }
    }

    return { isValid: true, error: null };
  }

  // Password strength indicator
  getPasswordStrength(password) {
    const validation = this.isValidPassword(password);
    let score = 0;
    let feedback = [];

    if (validation.minLength) score += 1;
    else feedback.push(languageService.t('passwordMinLength'));

    if (validation.hasUpperCase) score += 1;
    else feedback.push(languageService.t('Password should contain uppercase letters'));

    if (validation.hasLowerCase) score += 1;
    else feedback.push(languageService.t('Password should contain lowercase letters'));

    if (validation.hasNumbers) score += 1;
    else feedback.push(languageService.t('Password should contain numbers'));

    if (validation.hasSpecialChar) score += 1;
    else feedback.push(languageService.t('Password should contain special characters'));

    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return {
      score,
      strength,
      feedback,
      isValid: validation.isValid
    };
  }
}

// Export singleton instance
export default new ValidationService();