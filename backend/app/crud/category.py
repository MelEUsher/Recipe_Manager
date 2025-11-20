from sqlalchemy.orm import Session

from app import models, schemas


def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()


def get_categories(db: Session):
    return db.query(models.Category).order_by(models.Category.name).all()


def create_category(db: Session, category_in: schemas.CategoryCreate):
    category = models.Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, db_category: models.Category, category_in: schemas.CategoryUpdate):
    for field, value in category_in.model_dump(exclude_unset=True).items():
        setattr(db_category, field, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, db_category: models.Category):
    db.delete(db_category)
    db.commit()
