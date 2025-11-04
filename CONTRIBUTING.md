# Contributing to Recipe Manager

Thank you for your interest in contributing to the Recipe Manager project! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Keep discussions on-topic

## How to Contribute

There are many ways to contribute to this project:

1. **Report bugs** - Found a bug? Open an issue
2. **Suggest features** - Have an idea? Share it in discussions
3. **Improve documentation** - Help make our docs clearer
4. **Write code** - Fix bugs or implement features
5. **Write tests** - Help improve test coverage
6. **Review pull requests** - Share your expertise

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/ai-dev-session-1.git
cd ai-dev-session-1
```

### 2. Set Up Development Environment

Follow the [SETUP.md](SETUP.md) guide to set up your local development environment.

```bash
make setup
make install
make dev
```

### 3. Create a Branch

Create a branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` for new features
- `fix/` for bug fixes
- `docs/` for documentation changes
- `test/` for test-related changes
- `refactor/` for code refactoring

## Development Workflow

### Making Changes

1. **Write Code**: Make your changes following our coding standards
2. **Test**: Ensure all tests pass
3. **Format**: Format your code
4. **Commit**: Write clear commit messages

```bash
# Make your changes

# Run tests
make test

# Format code
make format

# Lint code
make lint

# Commit changes
git add .
git commit -m "feat: add recipe search functionality"
```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add recipe rating system
fix: correct ingredient amount calculation
docs: update setup instructions
test: add tests for recipe creation
```

### Code Style

#### Python (Backend)

- Follow PEP 8
- Use type hints where appropriate
- Maximum line length: 88 characters (Black default)
- Use docstrings for functions and classes

```python
def create_recipe(db: Session, recipe: schemas.RecipeCreate) -> models.Recipe:
    """
    Create a new recipe in the database.

    Args:
        db: Database session
        recipe: Recipe data to create

    Returns:
        Created recipe instance
    """
    # Implementation
```

Format with Black:
```bash
cd backend
black .
```

#### TypeScript/React (Frontend)

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Maximum line length: 80 characters
- Use meaningful variable names

```typescript
interface RecipeFormProps {
  initialData?: Partial<RecipeCreate>;
  onSubmit: (data: RecipeCreate) => Promise<void>;
  submitLabel?: string;
}

export default function RecipeForm({
  initialData,
  onSubmit,
  submitLabel = "Create Recipe",
}: RecipeFormProps) {
  // Implementation
}
```

Format with Prettier:
```bash
cd frontend
npm run format
```

### Testing

#### Backend Tests

Write tests for:
- API endpoints (integration tests)
- CRUD operations (unit tests)
- Edge cases and error handling

```python
def test_create_recipe(client: TestClient):
    """Test creating a recipe"""
    recipe_data = {
        "title": "Test Recipe",
        "instructions": "Test instructions",
        "ingredients": [],
    }
    response = client.post("/api/recipes", json=recipe_data)
    assert response.status_code == 201
    assert response.json()["title"] == recipe_data["title"]
```

Run tests:
```bash
cd backend
pytest -v
# or
make test-backend
```

#### Frontend Tests

Write tests for:
- Component rendering
- User interactions
- API integration (with mocks)
- Form validation

```typescript
describe('RecipeCard', () => {
  it('renders recipe information', () => {
    const mockRecipe = {
      id: 1,
      title: 'Test Recipe',
      // ... other fields
    };

    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });
});
```

Run tests:
```bash
cd frontend
npm test
# or
make test-frontend
```

## Pull Request Process

### Before Submitting

1. **Update Documentation**: If you change functionality, update relevant docs
2. **Add Tests**: Ensure your changes are covered by tests
3. **Run All Tests**: Make sure everything passes
4. **Format Code**: Run formatters and linters
5. **Update Changelog**: If applicable, note your changes

### Submitting a Pull Request

1. **Push Your Branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Link to related issues
   - Screenshots (if UI changes)
   - Test results

3. **Pull Request Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## How to Test
   Steps to test the changes

   ## Checklist
   - [ ] Tests pass
   - [ ] Code is formatted
   - [ ] Documentation updated
   - [ ] Changelog updated (if needed)
   ```

### Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

## Working with Issues

### Reporting Bugs

When reporting bugs, include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior**
- **Actual behavior**
- **Environment** (OS, browser, versions)
- **Screenshots** if applicable
- **Error messages** or logs

Example:
```markdown
## Bug: Recipe creation fails with empty ingredients

**Steps to Reproduce:**
1. Navigate to /recipes/new
2. Fill in title and instructions
3. Leave ingredients empty
4. Click "Create Recipe"

**Expected:** Recipe is created successfully
**Actual:** Error 500 is returned

**Environment:**
- OS: macOS 13.0
- Browser: Chrome 118
- Backend version: 1.0.0

**Error Message:**
```
ValueError: ingredients list cannot be empty
```
```

### Suggesting Features

When suggesting features, include:

- **Clear title** describing the feature
- **Problem** this feature solves
- **Proposed solution**
- **Alternative solutions** considered
- **Additional context** or mockups

## Project Structure

Understanding the project structure helps you contribute effectively:

```
ai-dev-session-1/
├── backend/               # FastAPI backend
│   ├── main.py           # Entry point
│   ├── models.py         # Database models
│   ├── schemas.py        # Pydantic schemas
│   ├── crud.py           # Database operations
│   ├── routers.py        # API routes
│   └── tests/            # Backend tests
├── frontend/             # Next.js frontend
│   ├── app/              # Pages (App Router)
│   ├── components/       # React components
│   ├── lib/              # Utilities (API client)
│   └── __tests__/        # Frontend tests
├── docs/                 # Documentation
├── Makefile              # Development commands
├── docker-compose.yml    # Docker configuration
└── README.md             # Project overview
```

## Database Migrations

When changing database models:

1. **Modify Models**: Edit `backend/models.py`

2. **Create Migration**:
   ```bash
   make migrate-create
   # Enter description when prompted
   ```

3. **Review Migration**: Check generated file in `backend/alembic/versions/`

4. **Apply Migration**:
   ```bash
   make migrate
   ```

5. **Test**: Verify changes work correctly

6. **Commit Migration**: Include migration file in your PR

## Adding New Dependencies

### Backend (Python)

1. Add to `backend/requirements.txt`:
   ```
   new-package==1.0.0
   ```

2. Install and test:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Document why the dependency is needed

### Frontend (Node.js)

1. Add dependency:
   ```bash
   cd frontend
   npm install new-package
   ```

2. Update `package.json` automatically

3. Commit `package.json` and `package-lock.json`

## Documentation

Good documentation is as important as good code!

### What to Document

- New features and how to use them
- API endpoints (parameters, responses)
- Configuration options
- Setup steps for new dependencies
- Architecture decisions

### Where to Document

- **README.md**: Project overview and quick start
- **SETUP.md**: Detailed setup instructions
- **ARCHITECTURE.md**: Technical architecture
- **Code comments**: Complex logic explanation
- **API docs**: FastAPI automatic documentation

## Getting Help

Need help contributing?

- Check existing documentation
- Review similar Pull Requests
- Ask in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (if we create one)
- Mentioned in release notes
- Credited in commit history

Thank you for contributing to Recipe Manager! Your efforts help make this project better for everyone.
