# Complete Testing Guide for Beginners

## Table of Contents
1. [What is Testing?](#what-is-testing)
2. [Why Test Your Code?](#why-test-your-code)
3. [Types of Tests](#types-of-tests)
4. [Understanding Pytest](#understanding-pytest)
5. [How to Write Tests](#how-to-write-tests)
6. [Running Tests](#running-tests)
7. [Test Coverage](#test-coverage)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## What is Testing?

**Testing** is writing code that checks if your main code works correctly. Think of it like:
- **Main code**: A calculator that adds numbers
- **Test code**: Code that checks "Does 2 + 2 actually equal 4?"

### Simple Example

```python
# main.py - Your actual code
def add_numbers(a, b):
    return a + b

# test_main.py - Your test code
def test_add_numbers():
    result = add_numbers(2, 3)
    assert result == 5  # Check if it's correct
```

If the test passes ✅, your code works. If it fails ❌, there's a bug.

---

## Why Test Your Code?

### 1. **Catch Bugs Early**
- Find problems before users do
- Fix issues when they're small and easy to fix

### 2. **Confidence to Change Code**
- Refactor (improve) code without fear
- Know if you broke something

### 3. **Documentation**
- Tests show how code is supposed to work
- New developers can understand by reading tests

### 4. **Prevent Regressions**
- Make sure old bugs don't come back
- Ensure new features don't break old ones

### 5. **Better Code Quality**
- Writing tests forces you to think about edge cases
- Makes you write more modular, testable code

---

## Types of Tests

### 1. **Unit Tests** (Test Individual Pieces)
Test one function or method in isolation.

**Example:**
```python
def test_customer_creation():
    """Test creating a customer works."""
    customer = Customer.objects.create(
        company_name="Test Company",
        email="test@example.com"
    )
    assert customer.company_name == "Test Company"
    assert customer.email == "test@example.com"
```

**What it tests:** Just the Customer model creation, nothing else.

### 2. **Integration Tests** (Test Multiple Pieces Together)
Test how different parts work together.

**Example:**
```python
def test_create_job_and_assign_driver():
    """Test creating a job and assigning a driver."""
    # Create job
    job = Job.objects.create(...)
    # Assign driver
    assignment = JobDriverAssignment.objects.create(...)
    # Check they're connected
    assert assignment.job == job
```

**What it tests:** Job creation + Driver assignment working together.

### 3. **API Tests** (Test HTTP Endpoints)
Test your REST API endpoints (GET, POST, PUT, DELETE).

**Example:**
```python
def test_create_customer_api():
    """Test POST /api/customers/ endpoint."""
    url = reverse('customer-list')
    data = {'company_name': 'Test Co', 'email': 'test@test.com'}
    response = client.post(url, data)
    assert response.status_code == 201  # Created
    assert response.data['company_name'] == 'Test Co'
```

**What it tests:** The entire HTTP request/response cycle.

### 4. **Serializer Tests** (Test Data Conversion)
Test that data converts correctly between Python objects and JSON.

**Example:**
```python
def test_serialize_customer():
    """Test converting Customer object to JSON."""
    customer = Customer.objects.create(company_name="Test")
    serializer = CustomerSerializer(customer)
    data = serializer.data
    assert data['company_name'] == 'Test'
    assert 'id' in data
```

**What it tests:** Data serialization (object → JSON) and deserialization (JSON → object).

---

## Understanding Pytest

### What is Pytest?

**Pytest** is a testing framework for Python. It makes writing and running tests easy.

### Key Concepts

#### 1. **Test Functions**
Any function that starts with `test_` is a test:

```python
def test_something():  # ✅ This is a test
    assert 1 + 1 == 2

def check_something():  # ❌ This is NOT a test (no test_ prefix)
    assert 1 + 1 == 2
```

#### 2. **Assertions**
Use `assert` to check if something is true:

```python
def test_example():
    result = 2 + 2
    assert result == 4  # If this is False, test fails
    assert result != 5   # If this is False, test fails
```

#### 3. **Test Classes**
Group related tests together:

```python
class TestCustomer:
    """All customer-related tests."""
    
    def test_create_customer(self):
        # Test 1
        pass
    
    def test_update_customer(self):
        # Test 2
        pass
```

#### 4. **Fixtures** (Reusable Test Data)
Fixtures provide data that multiple tests can use:

```python
@pytest.fixture
def test_customer(db):
    """Create a test customer for tests to use."""
    return Customer.objects.create(
        company_name='Test Customer',
        email='test@test.com'
    )

def test_something(test_customer):
    # test_customer is automatically provided
    assert test_customer.company_name == 'Test Customer'
```

**Why use fixtures?**
- Don't repeat code
- Consistent test data
- Easy to update in one place

---

## How to Write Tests

### Step-by-Step Guide

#### Step 1: Identify What to Test

Ask yourself:
- What should this function do?
- What are the edge cases?
- What could go wrong?

#### Step 2: Write the Test Structure

```python
def test_function_name():
    """Describe what this test does."""
    # Arrange: Set up test data
    # Act: Call the function
    # Assert: Check the result
```

#### Step 3: Follow AAA Pattern

**AAA = Arrange, Act, Assert**

```python
def test_customer_creation():
    """Test creating a customer."""
    # ARRANGE: Set up what you need
    company_name = "Test Company"
    email = "test@example.com"
    
    # ACT: Do the thing you're testing
    customer = Customer.objects.create(
        company_name=company_name,
        email=email
    )
    
    # ASSERT: Check if it worked
    assert customer.company_name == company_name
    assert customer.email == email
    assert customer.id is not None  # Should have an ID
```

### Real Examples from Your Project

#### Example 1: Model Test

```python
def test_customer_creation(self, db):
    """Test that we can create a customer."""
    customer = Customer.objects.create(
        company_name='Test Customer Inc',
        phone_number='555-1234',
        email='customer@test.com',
        address='123 Test St',
        city='Test City'
    )
    
    # Check it was saved
    assert customer.id is not None
    assert customer.company_name == 'Test Customer Inc'
    
    # Check it's in the database
    assert Customer.objects.filter(id=customer.id).exists()
```

**What this tests:**
- Can we create a Customer?
- Are the fields saved correctly?
- Is it in the database?

#### Example 2: API Test

```python
def test_create_customer(self, authenticated_api_client, db):
    """Test POST /api/customers/ endpoint."""
    url = reverse('customer-list')
    data = {
        'company_name': 'New Company',
        'email': 'new@company.com',
        'phone_number': '555-0000'
    }
    
    # Make POST request
    response = authenticated_api_client.post(url, data)
    
    # Check response
    assert response.status_code == 201  # Created
    assert response.data['company_name'] == 'New Company'
    
    # Check it's in database
    assert Customer.objects.filter(company_name='New Company').exists()
```

**What this tests:**
- Does the API endpoint work?
- Does it return the right status code?
- Is the data saved correctly?

#### Example 3: Serializer Test

```python
def test_serialize_customer(self, test_customer):
    """Test converting Customer to JSON."""
    serializer = CustomerSerializer(test_customer)
    data = serializer.data
    
    # Check all fields are present
    assert 'id' in data
    assert 'company_name' in data
    assert 'email' in data
    assert data['company_name'] == test_customer.company_name
```

**What this tests:**
- Does serialization work?
- Are all fields included?
- Are values correct?

---

## Running Tests

### Method 1: VS Code Test Explorer (Easiest)

1. **Open Test Explorer:**
   - Click the beaker/flask icon in the left sidebar
   - Or press `Ctrl+Shift+P` → "Test: Focus on Test View"

2. **See All Tests:**
   - Tests are organized by file
   - Expand to see individual tests

3. **Run Tests:**
   - Click ▶️ next to a test to run it
   - Click ▶️ next to a file to run all tests in that file
   - Click ▶️ at the top to run all tests

### Method 2: Terminal

```powershell
# Navigate to backend folder
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run all tests
python -m pytest myapp/tests/ -v

# Run specific test file
python -m pytest myapp/tests/test_models.py -v

# Run specific test
python -m pytest myapp/tests/test_models.py::CustomerTests::test_customer_creation -v
```

### Method 3: VS Code Tasks

1. Press `Ctrl+Shift+P`
2. Type "Tasks: Run Task"
3. Select:
   - "Backend: Run All Tests"
   - "Backend: Run Current Test File"
   - "Backend: Run Tests with Coverage"

### Understanding Test Output

When you run tests, you'll see:

```
============================= test session starts =============================
platform win32 -- Python 3.13.7, pytest-9.0.2
collected 147 items

test_models.py::CustomerTests::test_customer_creation PASSED [  1%]
test_models.py::CustomerTests::test_customer_optional_fields PASSED [  2%]
...

======================= 147 passed in 118.94s =======================
```

**What this means:**
- `collected 147 items`: Found 147 tests
- `PASSED`: Test succeeded ✅
- `FAILED`: Test failed ❌
- `147 passed`: All tests passed!

---

## Test Coverage

### What is Coverage?

**Coverage** = How much of your code is tested

- **100% coverage**: Every line of code is tested
- **50% coverage**: Half your code is tested
- **0% coverage**: No code is tested

### Why Coverage Matters

- **High coverage** = More confidence your code works
- **Low coverage** = Unknown if code works

**But remember:** 100% coverage doesn't mean bug-free! You need GOOD tests, not just many tests.

### How to Check Coverage

#### Step 1: Run Tests with Coverage

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest myapp/tests/ --cov=myapp --cov-report=html --cov-report=term -v
```

#### Step 2: View the Report

**Terminal Output:**
```
Name                    Stmts   Miss  Cover
-------------------------------------------
myapp/models.py           166      3    98%
myapp/serializers.py      166     16    90%
myapp/views.py            120      6    95%
-------------------------------------------
TOTAL                    1654    100    94%
```

**What this means:**
- `Stmts`: Total lines of code
- `Miss`: Lines not tested
- `Cover`: Percentage covered

**HTML Report:**
1. Open `backend/htmlcov/index.html` in your browser
2. See:
   - Overall coverage percentage
   - Coverage by file
   - Line-by-line coverage (green = covered, red = not covered)

### Your Current Coverage: 94% 🎉

This is excellent! Most of your code is tested.

### How to Improve Coverage

1. **Find uncovered lines:**
   - Open HTML report
   - Look for red lines

2. **Write tests for those lines:**
   - Add test cases that exercise that code
   - Test edge cases and error conditions

3. **Re-run coverage:**
   - See if coverage increased

---

## Best Practices

### 1. **Test One Thing at a Time**

❌ **Bad:**
```python
def test_everything():
    customer = Customer.objects.create(...)
    job = Job.objects.create(...)
    invoice = Invoice.objects.create(...)
    # Too many things!
```

✅ **Good:**
```python
def test_customer_creation():
    customer = Customer.objects.create(...)
    # Just test customer creation

def test_job_creation():
    job = Job.objects.create(...)
    # Just test job creation
```

### 2. **Use Descriptive Test Names**

❌ **Bad:**
```python
def test1():
def test_customer():
def test_thing():
```

✅ **Good:**
```python
def test_customer_creation():
def test_customer_email_validation():
def test_customer_cannot_have_duplicate_email():
```

### 3. **Follow AAA Pattern**

Always: **Arrange → Act → Assert**

```python
def test_example():
    # ARRANGE: Set up
    data = {'name': 'Test'}
    
    # ACT: Do it
    result = create_customer(data)
    
    # ASSERT: Check it
    assert result.name == 'Test'
```

### 4. **Test Edge Cases**

Don't just test the happy path:

```python
def test_customer_creation():
    # Happy path
    customer = Customer.objects.create(...)
    assert customer.id is not None

def test_customer_requires_company_name():
    # Edge case: What if company_name is missing?
    with pytest.raises(ValidationError):
        Customer.objects.create(email='test@test.com')
        # Should fail without company_name
```

### 5. **Use Fixtures for Common Data**

❌ **Bad:**
```python
def test_one():
    customer = Customer.objects.create(company_name='Test')
    # ...

def test_two():
    customer = Customer.objects.create(company_name='Test')  # Repeated!
    # ...
```

✅ **Good:**
```python
@pytest.fixture
def test_customer(db):
    return Customer.objects.create(company_name='Test')

def test_one(test_customer):
    # Use fixture
    assert test_customer.company_name == 'Test'

def test_two(test_customer):
    # Same fixture, no repetition
    assert test_customer.id is not None
```

### 6. **Keep Tests Independent**

Each test should work on its own:

```python
# ❌ Bad: Tests depend on each other
def test_create():
    customer = Customer.objects.create(...)

def test_update():
    customer.company_name = 'New'  # Assumes test_create ran first!

# ✅ Good: Each test is independent
def test_create():
    customer = Customer.objects.create(...)
    assert customer.id is not None

def test_update():
    customer = Customer.objects.create(...)  # Create fresh
    customer.company_name = 'New'
    assert customer.company_name == 'New'
```

### 7. **Test Behavior, Not Implementation**

❌ **Bad:**
```python
def test_customer():
    customer = Customer()
    assert customer._internal_field == 'value'  # Testing internal details
```

✅ **Good:**
```python
def test_customer():
    customer = Customer.objects.create(company_name='Test')
    assert customer.company_name == 'Test'  # Testing public behavior
```

---

## Common Patterns

### Pattern 1: Testing Model Creation

```python
def test_model_creation(self, db):
    """Test creating a model instance."""
    obj = MyModel.objects.create(
        field1='value1',
        field2='value2'
    )
    
    assert obj.id is not None
    assert obj.field1 == 'value1'
    assert MyModel.objects.filter(id=obj.id).exists()
```

### Pattern 2: Testing API Endpoints

```python
def test_api_endpoint(self, authenticated_api_client, db):
    """Test an API endpoint."""
    url = reverse('endpoint-name')
    data = {'field': 'value'}
    
    response = authenticated_api_client.post(url, data)
    
    assert response.status_code == 201
    assert response.data['field'] == 'value'
```

### Pattern 3: Testing Validation

```python
def test_validation(self, db):
    """Test that validation works."""
    with pytest.raises(ValidationError):
        MyModel.objects.create(
            # Missing required field
        )
```

### Pattern 4: Testing Relationships

```python
def test_relationship(self, db):
    """Test model relationships."""
    customer = Customer.objects.create(...)
    job = Job.objects.create(customer=customer, ...)
    
    assert job.customer == customer
    assert customer.jobs.count() == 1
```

### Pattern 5: Testing Calculations

```python
def test_calculation(self, db):
    """Test calculated fields."""
    line = InvoiceLine.objects.create(
        quantity=10,
        unit_price=5.00
    )
    
    assert line.line_total == Decimal('50.00')
```

---

## Troubleshooting

### Problem: "Database access not allowed"

**Error:**
```
RuntimeError: Database access not allowed, use the "django_db" mark
```

**Solution:**
Add `db` parameter to your test:

```python
def test_something(db):  # Add 'db' parameter
    customer = Customer.objects.create(...)
```

### Problem: "Module not found"

**Error:**
```
ModuleNotFoundError: No module named 'myapp'
```

**Solution:**
Make sure you're running from the `backend` directory:
```powershell
cd backend
python -m pytest myapp/tests/
```

### Problem: "Fixture not found"

**Error:**
```
FixtureNotFoundError: test_customer
```

**Solution:**
Make sure fixtures are in `conftest.py`:
```python
# backend/myapp/tests/conftest.py
@pytest.fixture
def test_customer(db):
    return Customer.objects.create(...)
```

### Problem: "Test passes but should fail"

**Check:**
1. Are you actually testing something?
2. Is your assertion correct?
3. Are you using the right data?

```python
# ❌ This always passes (not testing anything)
def test_bad():
    assert True  # Always True!

# ✅ This actually tests something
def test_good():
    result = 2 + 2
    assert result == 4
```

---

## Quick Reference

### Running Tests

```powershell
# All tests
pytest myapp/tests/ -v

# Specific file
pytest myapp/tests/test_models.py -v

# Specific test
pytest myapp/tests/test_models.py::TestName::test_function -v

# With coverage
pytest myapp/tests/ --cov=myapp --cov-report=html -v
```

### Writing Tests

```python
# Basic test
def test_something():
    assert 1 + 1 == 2

# Test with fixture
def test_something(test_customer):
    assert test_customer.id is not None

# Test class
class TestSomething:
    def test_one(self):
        pass
    
    def test_two(self):
        pass
```

### Common Assertions

```python
assert value == expected
assert value != expected
assert value is None
assert value is not None
assert 'key' in dictionary
assert len(list) == 5
assert value > 10
assert value < 10
```

---

## Summary

1. **Testing** = Writing code to check if your code works
2. **Pytest** = Tool for running tests in Python
3. **Unit tests** = Test individual functions
4. **Integration tests** = Test multiple parts together
5. **API tests** = Test HTTP endpoints
6. **Coverage** = How much code is tested
7. **Fixtures** = Reusable test data
8. **AAA Pattern** = Arrange, Act, Assert

### Your Project Status

- ✅ **147 tests** written
- ✅ **94% coverage** (excellent!)
- ✅ All tests passing
- ✅ Ready for deployment

### Next Steps

1. Keep writing tests for new features
2. Maintain high coverage
3. Review coverage report regularly
4. Test edge cases and error conditions
5. Refactor tests as code evolves

---

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [Django Testing Guide](https://docs.djangoproject.com/en/stable/topics/testing/)
- [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development)

---

**Remember:** Good tests give you confidence to change code without fear! 🚀


