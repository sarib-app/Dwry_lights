const permissions = [
    // CORE BUSINESS MODULES
    {
      "id": 1,
      "module": "sales_invoice",
      "name": "sales_invoice.management",
      "description": "To Open Sales Invoice Management",
      "type": "module"
    },
    {
      "id": 2,
      "module": "sales_invoice",
      "name": "sales_invoice.create",
      "description": "To create sales invoice",
      "type": "create"
    },
    {
      "id": 3,
      "module": "sales_invoice",
      "name": "sales_invoice.delete",
      "description": "To delete sales invoice",
      "type": "delete"
    },
    {
      "id": 4,
      "module": "sales_invoice",
      "name": "sales_invoice.edit",
      "description": "To edit sales invoice",
      "type": "edit"
    },
    {
      "id": 5,
      "module": "sales_invoice",
      "name": "sales_invoice.view",
      "description": "To view sales invoice",
      "type": "view"
    },
    {
      "id": 6,
      "module": "sales_invoice",
      "name": "sales_invoice.print",
      "description": "To print and share sales invoice",
      "type": "share"
    },

    // RETURN INVOICES MODULE
    {
      "id": 7,
      "module": "return_invoices",
      "name": "return_invoices.management",
      "description": "To Open Return Invoices Management",
      "type": "module"
    },
    {
      "id": 8,
      "module": "return_invoices",
      "name": "return_invoices.create",
      "description": "To create return invoices",
      "type": "create"
    },
    {
      "id": 9,
      "module": "return_invoices",
      "name": "return_invoices.delete",
      "description": "To delete return invoices",
      "type": "delete"
    },
    {
      "id": 10,
      "module": "return_invoices",
      "name": "return_invoices.edit",
      "description": "To edit return invoices",
      "type": "edit"
    },
    {
      "id": 11,
      "module": "return_invoices",
      "name": "return_invoices.view",
      "description": "To view return invoices",
      "type": "view"
    },
    {
      "id": 12,
      "module": "return_invoices",
      "name": "return_invoices.print",
      "description": "To print and share return invoices",
      "type": "share"
    },

    // PERMISSION MANAGEMENT MODULE
    {
      "id": 13,
      "module": "permission_management",
      "name": "permission_management.management",
      "description": "To Open Permission Management",
      "type": "module"
    },
    {
      "id": 14,
      "module": "permission_management",
      "name": "permission_management.create",
      "description": "To create permissions",
      "type": "create"
    },
    {
      "id": 15,
      "module": "permission_management",
      "name": "permission_management.delete",
      "description": "To delete permissions",
      "type": "delete"
    },
    {
      "id": 16,
      "module": "permission_management",
      "name": "permission_management.edit",
      "description": "To edit permissions",
      "type": "edit"
    },
    {
      "id": 17,
      "module": "permission_management",
      "name": "permission_management.view",
      "description": "To view permissions",
      "type": "view"
    },
    {
      "id": 18,
      "module": "permission_management",
      "name": "permission_management.print",
      "description": "To print and share permission reports",
      "type": "share"
    },

    // ITEMS MODULE
    {
      "id": 19,
      "module": "items",
      "name": "items.management",
      "description": "To Open Items Management",
      "type": "module"
    },
    {
      "id": 20,
      "module": "items",
      "name": "items.create",
      "description": "To create items",
      "type": "create"
    },
    {
      "id": 21,
      "module": "items",
      "name": "items.delete",
      "description": "To delete items",
      "type": "delete"
    },
    {
      "id": 22,
      "module": "items",
      "name": "items.edit",
      "description": "To edit items",
      "type": "edit"
    },
    {
      "id": 23,
      "module": "items",
      "name": "items.view",
      "description": "To view items",
      "type": "view"
    },
    {
      "id": 24,
      "module": "items",
      "name": "items.print",
      "description": "To print and share items",
      "type": "share"
    },

    // INVENTORY MODULE
    {
      "id": 25,
      "module": "inventory",
      "name": "inventory.management",
      "description": "To Open Inventory Management",
      "type": "module"
    },
    {
      "id": 26,
      "module": "inventory",
      "name": "inventory.create",
      "description": "To create inventory records",
      "type": "create"
    },
    {
      "id": 27,
      "module": "inventory",
      "name": "inventory.delete",
      "description": "To delete inventory records",
      "type": "delete"
    },
    {
      "id": 28,
      "module": "inventory",
      "name": "inventory.edit",
      "description": "To edit inventory records",
      "type": "edit"
    },
    {
      "id": 29,
      "module": "inventory",
      "name": "inventory.view",
      "description": "To view inventory records",
      "type": "view"
    },
    {
      "id": 30,
      "module": "inventory",
      "name": "inventory.print",
      "description": "To print and share inventory reports",
      "type": "share"
    },

    // BANKS MODULE
    {
      "id": 31,
      "module": "banks",
      "name": "banks.management",
      "description": "To Open Banks Management",
      "type": "module"
    },
    {
      "id": 32,
      "module": "banks",
      "name": "banks.create",
      "description": "To create bank accounts",
      "type": "create"
    },
    {
      "id": 33,
      "module": "banks",
      "name": "banks.delete",
      "description": "To delete bank accounts",
      "type": "delete"
    },
    {
      "id": 34,
      "module": "banks",
      "name": "banks.edit",
      "description": "To edit bank accounts",
      "type": "edit"
    },
    {
      "id": 35,
      "module": "banks",
      "name": "banks.view",
      "description": "To view bank accounts",
      "type": "view"
    },
    {
      "id": 36,
      "module": "banks",
      "name": "banks.print",
      "description": "To print and share bank reports",
      "type": "share"
    },

    // CUSTOMERS MODULE
    {
      "id": 37,
      "module": "customers",
      "name": "customers.management",
      "description": "To Open Customers Management",
      "type": "module"
    },
    {
      "id": 38,
      "module": "customers",
      "name": "customers.create",
      "description": "To create customers",
      "type": "create"
    },
    {
      "id": 39,
      "module": "customers",
      "name": "customers.delete",
      "description": "To delete customers",
      "type": "delete"
    },
    {
      "id": 40,
      "module": "customers",
      "name": "customers.edit",
      "description": "To edit customers",
      "type": "edit"
    },
    {
      "id": 41,
      "module": "customers",
      "name": "customers.view",
      "description": "To view customers",
      "type": "view"
    },
    {
      "id": 42,
      "module": "customers",
      "name": "customers.print",
      "description": "To print and share customer reports",
      "type": "share"
    },

    // STAFF MODULE
    {
      "id": 43,
      "module": "staff",
      "name": "staff.management",
      "description": "To Open Staff Management",
      "type": "module"
    },
    {
      "id": 44,
      "module": "staff",
      "name": "staff.create",
      "description": "To create staff members",
      "type": "create"
    },
    {
      "id": 45,
      "module": "staff",
      "name": "staff.delete",
      "description": "To delete staff members",
      "type": "delete"
    },
    {
      "id": 46,
      "module": "staff",
      "name": "staff.edit",
      "description": "To edit staff members",
      "type": "edit"
    },
    {
      "id": 47,
      "module": "staff",
      "name": "staff.view",
      "description": "To view staff members",
      "type": "view"
    },
    {
      "id": 48,
      "module": "staff",
      "name": "staff.print",
      "description": "To print and share staff reports",
      "type": "share"
    },

    // USER MODULE
    {
      "id": 49,
      "module": "user",
      "name": "user.management",
      "description": "To Open User Management",
      "type": "module"
    },
    {
      "id": 50,
      "module": "user",
      "name": "user.create",
      "description": "To create users",
      "type": "create"
    },
    {
      "id": 51,
      "module": "user",
      "name": "user.delete",
      "description": "To delete users",
      "type": "delete"
    },
    {
      "id": 52,
      "module": "user",
      "name": "user.edit",
      "description": "To edit users",
      "type": "edit"
    },
    {
      "id": 53,
      "module": "user",
      "name": "user.view",
      "description": "To view users",
      "type": "view"
    },
    {
      "id": 54,
      "module": "user",
      "name": "user.print",
      "description": "To print and share user reports",
      "type": "share"
    },

    // SUPPLIERS MODULE
    {
      "id": 55,
      "module": "suppliers",
      "name": "suppliers.management",
      "description": "To Open Suppliers Management",
      "type": "module"
    },
    {
      "id": 56,
      "module": "suppliers",
      "name": "suppliers.create",
      "description": "To create suppliers",
      "type": "create"
    },
    {
      "id": 57,
      "module": "suppliers",
      "name": "suppliers.delete",
      "description": "To delete suppliers",
      "type": "delete"
    },
    {
      "id": 58,
      "module": "suppliers",
      "name": "suppliers.edit",
      "description": "To edit suppliers",
      "type": "edit"
    },
    {
      "id": 59,
      "module": "suppliers",
      "name": "suppliers.view",
      "description": "To view suppliers",
      "type": "view"
    },
    {
      "id": 60,
      "module": "suppliers",
      "name": "suppliers.print",
      "description": "To print and share supplier reports",
      "type": "share"
    },

    // PURCHASE ORDERS MODULE
    {
      "id": 61,
      "module": "purchase_orders",
      "name": "purchase_orders.management",
      "description": "To Open Purchase Orders Management",
      "type": "module"
    },
    {
      "id": 62,
      "module": "purchase_orders",
      "name": "purchase_orders.create",
      "description": "To create purchase orders",
      "type": "create"
    },
    {
      "id": 63,
      "module": "purchase_orders",
      "name": "purchase_orders.delete",
      "description": "To delete purchase orders",
      "type": "delete"
    },
    {
      "id": 64,
      "module": "purchase_orders",
      "name": "purchase_orders.edit",
      "description": "To edit purchase orders",
      "type": "edit"
    },
    {
      "id": 65,
      "module": "purchase_orders",
      "name": "purchase_orders.view",
      "description": "To view purchase orders",
      "type": "view"
    },
    {
      "id": 66,
      "module": "purchase_orders",
      "name": "purchase_orders.print",
      "description": "To print and share purchase orders",
      "type": "share"
    },

    // EXPENSES MODULE
    {
      "id": 67,
      "module": "expenses",
      "name": "expenses.management",
      "description": "To Open Expenses Management",
      "type": "module"
    },
    {
      "id": 68,
      "module": "expenses",
      "name": "expenses.create",
      "description": "To create expenses",
      "type": "create"
    },
    {
      "id": 69,
      "module": "expenses",
      "name": "expenses.delete",
      "description": "To delete expenses",
      "type": "delete"
    },
    {
      "id": 70,
      "module": "expenses",
      "name": "expenses.edit",
      "description": "To edit expenses",
      "type": "edit"
    },
    {
      "id": 71,
      "module": "expenses",
      "name": "expenses.view",
      "description": "To view expenses",
      "type": "view"
    },
    {
      "id": 72,
      "module": "expenses",
      "name": "expenses.print",
      "description": "To print and share expense reports",
      "type": "share"
    },

    // PURCHASE INVOICE MODULE
    {
      "id": 73,
      "module": "purchase_invoice",
      "name": "purchase_invoice.management",
      "description": "To Open Purchase Invoice Management",
      "type": "module"
    },
    {
      "id": 74,
      "module": "purchase_invoice",
      "name": "purchase_invoice.create",
      "description": "To create purchase invoice",
      "type": "create"
    },
    {
      "id": 75,
      "module": "purchase_invoice",
      "name": "purchase_invoice.delete",
      "description": "To delete purchase invoice",
      "type": "delete"
    },
    {
      "id": 76,
      "module": "purchase_invoice",
      "name": "purchase_invoice.edit",
      "description": "To edit purchase invoice",
      "type": "edit"
    },
    {
      "id": 77,
      "module": "purchase_invoice",
      "name": "purchase_invoice.view",
      "description": "To view purchase invoice",
      "type": "view"
    },
    {
      "id": 78,
      "module": "purchase_invoice",
      "name": "purchase_invoice.print",
      "description": "To print and share purchase invoice",
      "type": "share"
    },

    // PAYMENTS MODULE
    {
      "id": 79,
      "module": "payments",
      "name": "payments.management",
      "description": "To Open Payments Management",
      "type": "module"
    },
    {
      "id": 80,
      "module": "payments",
      "name": "payments.create",
      "description": "To create payments",
      "type": "create"
    },
    {
      "id": 81,
      "module": "payments",
      "name": "payments.delete",
      "description": "To delete payments",
      "type": "delete"
    },
    {
      "id": 82,
      "module": "payments",
      "name": "payments.edit",
      "description": "To edit payments",
      "type": "edit"
    },
    {
      "id": 83,
      "module": "payments",
      "name": "payments.view",
      "description": "To view payments",
      "type": "view"
    },
    {
      "id": 84,
      "module": "payments",
      "name": "payments.print",
      "description": "To print and share payment reports",
      "type": "share"
    },

    // REPORTS MODULE
    {
      "id": 85,
      "module": "reports",
      "name": "reports.management",
      "description": "To Open Reports Management",
      "type": "module"
    },
    {
      "id": 86,
      "module": "reports",
      "name": "reports.create",
      "description": "To create custom reports",
      "type": "create"
    },
    {
      "id": 87,
      "module": "reports",
      "name": "reports.delete",
      "description": "To delete reports",
      "type": "delete"
    },
    {
      "id": 88,
      "module": "reports",
      "name": "reports.edit",
      "description": "To edit reports",
      "type": "edit"
    },
    {
      "id": 89,
      "module": "reports",
      "name": "reports.view",
      "description": "To view reports",
      "type": "view"
    },
    {
      "id": 90,
      "module": "reports",
      "name": "reports.print",
      "description": "To print and share reports",
      "type": "share"
    },

    // TERRITORIES MODULE
    {
      "id": 91,
      "module": "territories",
      "name": "territories.management",
      "description": "To Open Territories Management",
      "type": "module"
    },
    {
      "id": 92,
      "module": "territories",
      "name": "territories.create",
      "description": "To create territories",
      "type": "create"
    },
    {
      "id": 93,
      "module": "territories",
      "name": "territories.delete",
      "description": "To delete territories",
      "type": "delete"
    },
    {
      "id": 94,
      "module": "territories",
      "name": "territories.edit",
      "description": "To edit territories",
      "type": "edit"
    },
    {
      "id": 95,
      "module": "territories",
      "name": "territories.view",
      "description": "To view territories",
      "type": "view"
    },
    {
      "id": 96,
      "module": "territories",
      "name": "territories.print",
      "description": "To print and share territory reports",
      "type": "share"
    },

    // QUOTATIONS MODULE
    {
      "id": 97,
      "module": "quotations",
      "name": "quotations.management",
      "description": "To Open Quotations Management",
      "type": "module"
    },
    {
      "id": 98,
      "module": "quotations",
      "name": "quotations.create",
      "description": "To create quotations",
      "type": "create"
    },
    {
      "id": 99,
      "module": "quotations",
      "name": "quotations.delete",
      "description": "To delete quotations",
      "type": "delete"
    },
    {
      "id": 100,
      "module": "quotations",
      "name": "quotations.edit",
      "description": "To edit quotations",
      "type": "edit"
    },
    {
      "id": 101,
      "module": "quotations",
      "name": "quotations.view",
      "description": "To view quotations",
      "type": "view"
    },
    {
      "id": 102,
      "module": "quotations",
      "name": "quotations.print",
      "description": "To print and share quotations",
      "type": "share"
    },

    // RETURNS MODULE
    {
      "id": 103,
      "module": "returns",
      "name": "returns.management",
      "description": "To Open Returns Management",
      "type": "module"
    },
    {
      "id": 104,
      "module": "returns",
      "name": "returns.create",
      "description": "To create returns",
      "type": "create"
    },
    {
      "id": 105,
      "module": "returns",
      "name": "returns.delete",
      "description": "To delete returns",
      "type": "delete"
    },
    {
      "id": 106,
      "module": "returns",
      "name": "returns.edit",
      "description": "To edit returns",
      "type": "edit"
    },
    {
      "id": 107,
      "module": "returns",
      "name": "returns.view",
      "description": "To view returns",
      "type": "view"
    },
    {
      "id": 108,
      "module": "returns",
      "name": "returns.print",
      "description": "To print and share return reports",
      "type": "share"
    },

    // REPORTS DASHBOARD MODULES

    // SALES REPORT MODULE
    {
      "id": 109,
      "module": "sales_report",
      "name": "sales_report.management",
      "description": "To Open Sales Report Management",
      "type": "module"
    },
    {
      "id": 110,
      "module": "sales_report",
      "name": "sales_report.create",
      "description": "To create sales reports",
      "type": "create"
    },
    {
      "id": 111,
      "module": "sales_report",
      "name": "sales_report.delete",
      "description": "To delete sales reports",
      "type": "delete"
    },
    {
      "id": 112,
      "module": "sales_report",
      "name": "sales_report.edit",
      "description": "To edit sales reports",
      "type": "edit"
    },
    {
      "id": 113,
      "module": "sales_report",
      "name": "sales_report.view",
      "description": "To view sales reports",
      "type": "view"
    },
    {
      "id": 114,
      "module": "sales_report",
      "name": "sales_report.print",
      "description": "To print and share sales reports",
      "type": "share"
    },

    // CUSTOMER REPORT MODULE
    {
      "id": 115,
      "module": "customer_report",
      "name": "customer_report.management",
      "description": "To Open Customer Report Management",
      "type": "module"
    },
    {
      "id": 116,
      "module": "customer_report",
      "name": "customer_report.create",
      "description": "To create customer reports",
      "type": "create"
    },
    {
      "id": 117,
      "module": "customer_report",
      "name": "customer_report.delete",
      "description": "To delete customer reports",
      "type": "delete"
    },
    {
      "id": 118,
      "module": "customer_report",
      "name": "customer_report.edit",
      "description": "To edit customer reports",
      "type": "edit"
    },
    {
      "id": 119,
      "module": "customer_report",
      "name": "customer_report.view",
      "description": "To view customer reports",
      "type": "view"
    },
    {
      "id": 120,
      "module": "customer_report",
      "name": "customer_report.print",
      "description": "To print and share customer reports",
      "type": "share"
    },

    // INVENTORY STATS MODULE
    {
      "id": 121,
      "module": "inventory_stats",
      "name": "inventory_stats.management",
      "description": "To Open Inventory Stats Management",
      "type": "module"
    },
    {
      "id": 122,
      "module": "inventory_stats",
      "name": "inventory_stats.create",
      "description": "To create inventory statistics",
      "type": "create"
    },
    {
      "id": 123,
      "module": "inventory_stats",
      "name": "inventory_stats.delete",
      "description": "To delete inventory statistics",
      "type": "delete"
    },
    {
      "id": 124,
      "module": "inventory_stats",
      "name": "inventory_stats.edit",
      "description": "To edit inventory statistics",
      "type": "edit"
    },
    {
      "id": 125,
      "module": "inventory_stats",
      "name": "inventory_stats.view",
      "description": "To view inventory statistics",
      "type": "view"
    },
    {
      "id": 126,
      "module": "inventory_stats",
      "name": "inventory_stats.print",
      "description": "To print and share inventory statistics",
      "type": "share"
    },

    // FINANCIAL SUMMARY MODULE
    {
      "id": 127,
      "module": "financial_summary",
      "name": "financial_summary.management",
      "description": "To Open Financial Summary Management",
      "type": "module"
    },
    {
      "id": 128,
      "module": "financial_summary",
      "name": "financial_summary.create",
      "description": "To create financial summaries",
      "type": "create"
    },
    {
      "id": 129,
      "module": "financial_summary",
      "name": "financial_summary.delete",
      "description": "To delete financial summaries",
      "type": "delete"
    },
    {
      "id": 130,
      "module": "financial_summary",
      "name": "financial_summary.edit",
      "description": "To edit financial summaries",
      "type": "edit"
    },
    {
      "id": 131,
      "module": "financial_summary",
      "name": "financial_summary.view",
      "description": "To view financial summaries",
      "type": "view"
    },
    {
      "id": 132,
      "module": "financial_summary",
      "name": "financial_summary.print",
      "description": "To print and share financial summaries",
      "type": "share"
    },

    // SET SALES TARGET MODULE
    {
      "id": 133,
      "module": "set_sales_target",
      "name": "set_sales_target.management",
      "description": "To Open Set Sales Target Management",
      "type": "module"
    },
    {
      "id": 134,
      "module": "set_sales_target",
      "name": "set_sales_target.create",
      "description": "To create sales targets",
      "type": "create"
    },
    {
      "id": 135,
      "module": "set_sales_target",
      "name": "set_sales_target.delete",
      "description": "To delete sales targets",
      "type": "delete"
    },
    {
      "id": 136,
      "module": "set_sales_target",
      "name": "set_sales_target.edit",
      "description": "To edit sales targets",
      "type": "edit"
    },
    {
      "id": 137,
      "module": "set_sales_target",
      "name": "set_sales_target.view",
      "description": "To view sales targets",
      "type": "view"
    },
    {
      "id": 138,
      "module": "set_sales_target",
      "name": "set_sales_target.print",
      "description": "To print and share sales targets",
      "type": "share"
    },

    // SALES TARGET REPORT MODULE
    {
      "id": 139,
      "module": "sales_target_report",
      "name": "sales_target_report.management",
      "description": "To Open Sales Target Report Management",
      "type": "module"
    },
    {
      "id": 140,
      "module": "sales_target_report",
      "name": "sales_target_report.create",
      "description": "To create sales target reports",
      "type": "create"
    },
    {
      "id": 141,
      "module": "sales_target_report",
      "name": "sales_target_report.delete",
      "description": "To delete sales target reports",
      "type": "delete"
    },
    {
      "id": 142,
      "module": "sales_target_report",
      "name": "sales_target_report.edit",
      "description": "To edit sales target reports",
      "type": "edit"
    },
    {
      "id": 143,
      "module": "sales_target_report",
      "name": "sales_target_report.view",
      "description": "To view sales target reports",
      "type": "view"
    },
    {
      "id": 144,
      "module": "sales_target_report",
      "name": "sales_target_report.print",
      "description": "To print and share sales target reports",
      "type": "share"
    },

    // RECORD VISIT MODULE
    {
      "id": 145,
      "module": "record_visit",
      "name": "record_visit.management",
      "description": "To Open Record Visit Management",
      "type": "module"
    },
    {
      "id": 146,
      "module": "record_visit",
      "name": "record_visit.create",
      "description": "To create visit records",
      "type": "create"
    },
    {
      "id": 147,
      "module": "record_visit",
      "name": "record_visit.delete",
      "description": "To delete visit records",
      "type": "delete"
    },
    {
      "id": 148,
      "module": "record_visit",
      "name": "record_visit.edit",
      "description": "To edit visit records",
      "type": "edit"
    },
    {
      "id": 149,
      "module": "record_visit",
      "name": "record_visit.view",
      "description": "To view visit records",
      "type": "view"
    },
    {
      "id": 150,
      "module": "record_visit",
      "name": "record_visit.print",
      "description": "To print and share visit records",
      "type": "share"
    },

    // VISIT REPORT MODULE
    {
      "id": 151,
      "module": "visit_report",
      "name": "visit_report.management",
      "description": "To Open Visit Report Management",
      "type": "module"
    },
    {
      "id": 152,
      "module": "visit_report",
      "name": "visit_report.create",
      "description": "To create visit reports",
      "type": "create"
    },
    {
      "id": 153,
      "module": "visit_report",
      "name": "visit_report.delete",
      "description": "To delete visit reports",
      "type": "delete"
    },
    {
      "id": 154,
      "module": "visit_report",
      "name": "visit_report.edit",
      "description": "To edit visit reports",
      "type": "edit"
    },
    {
      "id": 155,
      "module": "visit_report",
      "name": "visit_report.view",
      "description": "To view visit reports",
      "type": "view"
    },
    {
      "id": 156,
      "module": "visit_report",
      "name": "visit_report.print",
      "description": "To print and share visit reports",
      "type": "share"
    }
  ]
