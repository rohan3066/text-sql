from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Date, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    gender = Column(String(10))
    date_of_birth = Column(Date)
    status = Column(String(20), default='Active')
    role = Column(String(20), default='USER')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    history = relationship("QueryHistory", back_populates="user", cascade="all, delete-orphan")
    saved_queries = relationship("SavedQuery", back_populates="user", cascade="all, delete-orphan")

class QueryHistory(Base):
    __tablename__ = 'query_history'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    natural_language_question = Column(Text, nullable=False)
    generated_sql = Column(Text, nullable=False)
    explanation = Column(Text)
    execution_status = Column(String(20), nullable=False) # 'Success' or 'Failed'
    execution_time = Column(Float) # in ms
    row_count = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="history")

class SavedQuery(Base):
    __tablename__ = 'saved_queries'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    sql = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_queries")
