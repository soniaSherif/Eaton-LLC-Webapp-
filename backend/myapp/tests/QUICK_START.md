# Quick Start: Testing in 5 Minutes

## 🎯 What You Need to Know

### 1. What is a Test?
Code that checks if your code works correctly.

```python
# Your code
def add(a, b):
    return a + b

# Your test
def test_add():
    result = add(2, 3)
    assert result == 5  # ✅ Passes if correct
```

### 2. How to Write a Test

**Simple 3-step process:**

```python
def test_customer_creation():
    # Step 1: ARRANGE - Set up data
    company_name = "Test Company"
    
    # Step 2: ACT - Do the thing
    customer = Customer.objects.create(company_name=company_name)
    
    # Step 3: ASSERT - Check it worked
    assert customer.company_name == company_name
    assert customer.id is not None
```

### 3. How to Run Tests

**Option 1: VS Code (Easiest)**
- Click the beaker icon (🧪) in sidebar
- Click ▶️ next to any test

**Option 2: Terminal**
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest myapp/tests/ -v
```

### 4. How to Check Coverage

```powershell
cd backend
.\venv\Scripts\python.exe -m pytest myapp/tests/ --cov=myapp --cov-report=html -v
```

Then open: `backend/htmlcov/index.html`

---

## 📝 Test Template

Copy and modify this template:

```python
def test_your_feature_name():
    """Test that [describe what you're testing]."""
    # ARRANGE: Set up what you need
    # ... your setup code ...
    
    # ACT: Do the thing you're testing
    # ... your action code ...
    
    # ASSERT: Check if it worked
    assert something == expected_value
```

---

## 🎓 Common Test Patterns

### Test Model Creation
```python
def test_create_model(db):
    obj = MyModel.objects.create(field='value')
    assert obj.id is not None
    assert obj.field == 'value'
```

### Test API Endpoint
```python
def test_api_endpoint(authenticated_api_client, db):
    url = reverse('endpoint-name')
    data = {'field': 'value'}
    response = authenticated_api_client.post(url, data)
    assert response.status_code == 201
```

### Test Validation
```python
def test_validation(db):
    with pytest.raises(ValidationError):
        MyModel.objects.create()  # Missing required field
```

---

## ✅ Checklist for Writing Tests

- [ ] Test name starts with `test_`
- [ ] Test has a docstring explaining what it tests
- [ ] Follows AAA pattern (Arrange, Act, Assert)
- [ ] Tests one thing at a time
- [ ] Uses descriptive assertions
- [ ] Handles edge cases

---

## 🚀 Your Current Status

- ✅ **147 tests** written
- ✅ **94% coverage** 
- ✅ All tests passing
- ✅ Ready to deploy!

---

**Need more details?** See `TESTING_GUIDE.md` for the complete guide!


