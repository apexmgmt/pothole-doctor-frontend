# Entity Details Component System

This system provides a flexible and reusable way to display detailed information about different entities (leads, customers, etc.) with tabbed interfaces and dynamic data.

## Components Overview

### 1. EntityDetails (Generic Component)

**Location**: `components/erp/common/EntityDetails.jsx`

A flexible, reusable component that can display details for any entity type with customizable tabs and data.

### 2. LeadDetails (Lead-specific)

**Location**: `components/erp/dashboard/crm/leads/LeadDetails.jsx`

A specialized component for lead details using the generic EntityDetails component.

### 3. CustomerDetails (Customer-specific)

**Location**: `components/erp/dashboard/crm/customers/CustomerDetails.jsx`

A specialized component for customer details using the generic EntityDetails component.

### 4. AdvancedCustomerDetails (Advanced Example)

**Location**: `components/erp/dashboard/crm/customers/AdvancedCustomerDetails.jsx`

An advanced example showing how to customize tabs and add entity-specific functionality.

## Usage Examples

### Basic Usage (Lead Details)

```jsx
import LeadDetails from "./LeadDetails";

const Leads = () => {
  const leadData = {
    id: "001545464",
    name: "Pothole Doctors",
    phone: "(740) 330-5155",
    email: "todd@potholedoctors.com",
    jobAddress: "708-D Fairground Rd, Lucasville, OH 45648",
    leadSource: "Repair",
    stage: "Open",
  };

  return (
    <LeadDetails leadData={leadData} onEdit={() => console.log("Edit lead")} />
  );
};
```

### Basic Usage (Customer Details)

```jsx
import CustomerDetails from "./CustomerDetails";

const Customers = () => {
  const customerData = {
    id: "001545464",
    name: "Pothole Doctors",
    phone: "(740) 330-5155",
    email: "todd@potholedoctors.com",
    address: "708-D Fairground Rd, Lucasville, OH 45648",
    totalSpent: "$8,700.00",
  };

  return (
    <CustomerDetails
      customerData={customerData}
      onEdit={() => console.log("Edit customer")}
    />
  );
};
```

### Advanced Usage (Custom Tabs)

```jsx
import EntityDetails from "../../../common/EntityDetails";

const CustomEntityDetails = ({ entityData, onEdit }) => {
  const customTabs = [
    {
      id: "custom-tab",
      label: "Custom Tab",
      icon: CustomIcon,
      data: [
        {
          id: 1,
          customField: "Custom Value",
          anotherField: "Another Value",
        },
      ],
      columns: [
        { key: "checkbox", label: "" },
        { key: "customField", label: "Custom Field", sortable: true },
        { key: "anotherField", label: "Another Field", sortable: true },
      ],
      actionButtons: [
        {
          label: "Custom Action",
          action: "custom_action",
          variant: "primary",
          icon: PlusIcon,
        },
      ],
    },
  ];

  return (
    <EntityDetails
      entityData={entityData}
      entityType="custom"
      onEdit={onEdit}
      customTabs={customTabs}
    />
  );
};
```

## Component Props

### EntityDetails Props

| Prop         | Type     | Required | Description                                                        |
| ------------ | -------- | -------- | ------------------------------------------------------------------ |
| `entityData` | Object   | Yes      | The data object containing entity information                      |
| `entityType` | String   | No       | Type of entity ("lead", "customer", etc.) - affects display labels |
| `onEdit`     | Function | No       | Callback function when edit button is clicked                      |
| `customTabs` | Array    | No       | Custom tab configuration to override default tabs                  |

### EntityData Object Structure

```javascript
{
  id: "001545464",           // Unique identifier
  name: "Entity Name",       // Display name
  email: "email@example.com", // Email address
  phone: "(740) 330-5155",   // Phone number
  jobAddress: "Address...",  // Job/primary address
  address: "Address...",     // Alternative address field
  createdDate: "12-07-2025", // Creation date
  totalSpent: "$8,700.00"    // Customer-specific: total amount spent
}
```

### Custom Tabs Structure

```javascript
{
  id: "tab-id",              // Unique tab identifier
  label: "Tab Label",        // Display label
  icon: IconComponent,       // Icon component
  data: [...],               // Array of data objects
  columns: [...],            // Column configuration
  actionButtons: [...]       // Action buttons for this tab
}
```

## Default Tabs

The EntityDetails component comes with 7 default tabs:

1. **Email** - Email communications
2. **SMS** - SMS communications
3. **Documents** - Document management
4. **Contacts** - Contact information
5. **Addresses** - Address management
6. **Measurements** - Measurement data
7. **Estimate** - Estimate information

## Features

### Built-in Features

- ✅ Responsive design
- ✅ Tab navigation
- ✅ Data tables with sorting
- ✅ Row selection
- ✅ Export functionality (Excel, PDF)
- ✅ Search functionality
- ✅ Action buttons per tab
- ✅ Edit functionality
- ✅ Dynamic data binding
- ✅ Customizable tabs
- ✅ Entity-specific information display

### Customization Options

- Custom tabs with unique data structures
- Custom action buttons per tab
- Custom column configurations
- Entity-specific information fields
- Custom styling through CSS classes

## Integration with Existing Components

The EntityDetails component integrates seamlessly with:

- **CustomTable** - For data display and management
- **CustomButton** - For action buttons
- **CommonLayout** - For consistent page layouts
- **FilterDrawer** - For advanced filtering (when needed)

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- Dark theme with `bg-bg-2`, `text-light`, `text-gray` colors
- Primary color scheme with `bg-primary`, `text-primary`
- Consistent spacing and border styling
- Responsive grid layouts

## Best Practices

1. **Data Structure**: Keep entity data consistent across different entity types
2. **Custom Tabs**: Use custom tabs for entity-specific functionality
3. **Action Handlers**: Implement proper action handlers for buttons
4. **Error Handling**: Add error boundaries for data loading
5. **Performance**: Use React.memo for large datasets
6. **Accessibility**: Ensure proper ARIA labels and keyboard navigation

## Future Enhancements

- Real-time data updates
- Advanced filtering per tab
- Bulk operations
- Custom field definitions
- API integration helpers
- Data validation
- Export customization
- Print functionality




