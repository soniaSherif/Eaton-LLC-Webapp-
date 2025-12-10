# Invoice Test Suite

This directory contains comprehensive pytest unit tests for the invoice functionality.

## Test Structure

```
tests/
├── __init__.py                    # Package initialization
├── conftest.py                    # Shared pytest fixtures
├── README.md                      # This file
├── test_invoice_models.py            # Tests for Invoice and InvoiceLine models
├── test_invoice_serializers.py    # Tests for Invoice and InvoiceLine serializers
├── test_invoice_views.py          # Tests for InvoiceViewSet API endpoints
└── test_invoice_api_integration.py # Integration tests for complete workflows
```

## Test Files Description

### `conftest.py`
Contains reusable pytest fixtures for:
- Test users, customers, jobs, invoices
- API clients (authenticated and unauthenticated)
- Date ranges for testing
- Common test data setup

### `test_invoice_models.py`
Tests the Invoice and InvoiceLine Django models:
- Model creation and validation
- Invoice number auto-generation
- Total calculation
- Date range functionality
- Model relationships
- Cascade deletes

### `test_invoice_serializers.py`
Tests the DRF serializers:
- Serialization/deserialization
- Date range handling
- Auto-population of lines from date range
- Nested customer and job data
- Line updates and deletions

### `test_invoice_views.py`
Tests the API endpoints:
- GET /api/invoices/ - List all invoices
- POST /api/invoices/ - Create invoice
- GET /api/invoices/{id}/ - Get invoice details
- PATCH /api/invoices/{id}/ - Update invoice
- DELETE /api/invoices/{id}/ - Delete invoice
- Filtering by customer, project, status, date

### `test_invoice_api_integration.py`
Integration tests for complete workflows:
- Create invoice with date range auto-population
- Invoice lifecycle (Draft -> Sent -> Paid)
- Multiple line calculations
- Date range filtering

## Running the Tests

### Run all invoice tests:
```bash
pytest backend/myapp/tests/ -v
```

### Run a specific test file:
```bash
pytest backend/myapp/tests/test_invoice_models.py -v
```

### Run a specific test class:
```bash
pytest backend/myapp/tests/test_invoice_models.py::TestInvoiceModel -v
```

### Run a specific test:
```bash
pytest backend/myapp/tests/test_invoice_models.py::TestInvoiceModel::test_invoice_creation -v
```

### Run with coverage:
```bash
pytest backend/myapp/tests/ --cov=myapp --cov-report=html
```

## Test Coverage

The test suite covers:
- ✅ Invoice model creation and validation
- ✅ InvoiceLine model creation and calculations
- ✅ Invoice number auto-generation
- ✅ Date range functionality (start_date, end_date)
- ✅ Auto-population of lines from job driver assignments within date range
- ✅ Serializer serialization/deserialization
- ✅ API CRUD operations
- ✅ Filtering functionality
- ✅ Nested data (customer, job) in responses
- ✅ Line updates and deletions
- ✅ Total amount calculations
- ✅ Error handling and edge cases

## Fixtures

All test fixtures are defined in `conftest.py` and can be used across all test files:
- `test_user` - Django User instance
- `test_customer` - Customer instance
- `test_job` - Job instance
- `test_invoice` - Invoice instance
- `test_invoice_line` - InvoiceLine instance
- `authenticated_api_client` - Authenticated APIClient for API tests
- `date_range` - Dictionary with start_date and end_date (week range)

## Writing New Tests

When adding new tests:
1. Use existing fixtures from `conftest.py` when possible
2. Follow the naming convention: `test_<what_you_are_testing>`
3. Group related tests in classes
4. Use descriptive test names
5. Add docstrings explaining what each test does
6. Use pytest assertions: `assert` instead of `self.assertEqual`

## Example Test Structure

```python
class TestMyFeature:
    """Brief description of what this test class covers."""
    
    def test_specific_functionality(self, test_fixture):
        """Test that specific functionality works correctly."""
        # Arrange
        # Act
        # Assert
        assert result == expected
```

