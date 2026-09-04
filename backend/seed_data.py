"""
Database Seeding Script for UniGigs

Run this to populate your database with demo data
"""

from sqlalchemy.orm import Session

from app.db.database import SessionLocal, engine, Base

from app.models.user import User, UserRole, Profile
from app.models.gig import Gig, GigStatus
from app.models.category import Category
from app.models.skill import Skill
from app.models.application import Application, ApplicationStatus
from app.models.contract import Contract, ContractStatus

from app.core.security import get_password_hash

from datetime import datetime, timedelta
import random
from app.models.notification import Notification
from app.models.saved_gig import SavedGig
from app.models.portfolio import PortfolioItem
from app.models.message import Message
# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # ============ CATEGORIES ============
    categories_data = [
        {"name": "Design", "description": "Graphic design, logos, UI/UX", "icon": "🎨"},
        {"name": "Development", "description": "Web, mobile, software development", "icon": "💻"},
        {"name": "Writing", "description": "Content writing, copywriting, editing", "icon": "✍️"},
        {"name": "Video & Audio", "description": "Video editing, music, voiceovers", "icon": "🎬"},
        {"name": "Marketing", "description": "Social media, SEO, digital marketing", "icon": "📈"},
        {"name": "Data & Analytics", "description": "Data analysis, Excel, research", "icon": "📊"},
    ]

    categories = []
    for cat_data in categories_data:
        cat = Category(**cat_data)
        db.add(cat)
        categories.append(cat)
    db.commit()

    # ============ SKILLS ============
    skills_data = [
        ("Logo Design", "Design"),
        ("Web Design", "Design"),
        ("Figma", "Design"),
        ("React", "Development"),
        ("Python", "Development"),
        ("Node.js", "Development"),
        ("Content Writing", "Writing"),
        ("Copywriting", "Writing"),
        ("Video Editing", "Video & Audio"),
        ("Social Media Marketing", "Marketing"),
        ("Data Analysis", "Data & Analytics"),
        ("Excel", "Data & Analytics"),
    ]

    skills = []
    for name, category in skills_data:
        skill = Skill(name=name, category=category)
        db.add(skill)
        skills.append(skill)
    db.commit()

    # ============ USERS (Students & Clients) ============
    users_data = [
        # Students (Freelancers)
        {"email": "student1@college.edu", "password": "password123", "role": UserRole.STUDENT},
        {"email": "student2@college.edu", "password": "password123", "role": UserRole.STUDENT},
        {"email": "student3@college.edu", "password": "password123", "role": UserRole.STUDENT},
        {"email": "student4@college.edu", "password": "password123", "role": UserRole.STUDENT},
        {"email": "student5@college.edu", "password": "password123", "role": UserRole.STUDENT},
        # Clients
        {"email": "client1@startup.com", "password": "password123", "role": UserRole.CLIENT},
        {"email": "client2@company.com", "password": "password123", "role": UserRole.CLIENT},
        {"email": "client3@college.edu", "password": "password123", "role": UserRole.CLIENT},
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            role=user_data["role"],
        )
        db.add(user)
        users.append(user)
    db.commit()

    # ============ PROFILES ============
    profiles_data = [
        {"user_id": 1, "full_name": "Priya Sharma", "bio": "Graphic designer passionate about creating beautiful logos and brand identities.", "university": "Mumbai University", "availability": "available"},
        {"user_id": 2, "full_name": "Rahul Verma", "bio": "Full-stack developer specializing in React and Node.js. Love building web apps!", "university": "Delhi Tech", "availability": "available"},
        {"user_id": 3, "full_name": "Ananya Iyer", "bio": "Content writer with 3+ years of experience. SEO expert and storyteller.", "university": "Bangalore College", "availability": "available"},
        {"user_id": 4, "full_name": "Arjun Patel", "bio": "Video editor and motion graphics designer. Adobe Premiere & After Effects pro.", "university": "Pune Institute", "availability": "busy"},
        {"user_id": 5, "full_name": "Sneha Reddy", "bio": "Data analyst skilled in Python, Excel, and visualization. Love turning data into insights!", "university": "Hyderabad University", "availability": "available"},
        {"user_id": 6, "full_name": "TechStart Solutions", "bio": "We're a student startup looking for talented freelancers!", "university": "", "availability": "available"},
        {"user_id": 7, "full_name": "Campus Events Team", "bio": "Official college events committee. We hire students for various projects.", "university": "Mumbai University", "availability": "available"},
        {"user_id": 8, "full_name": "Digital Marketing Club", "bio": "Student-run marketing agency. We help businesses grow online.", "university": "", "availability": "available"},
    ]

    profiles = []
    for profile_data in profiles_data:
        profile = Profile(**profile_data)
        db.add(profile)
        profiles.append(profile)
    db.commit()

    # ============ GIGS ============
    gigs_data = [
        {"title": "Logo Design for College Event", "description": "Need a creative logo for our annual college fest 'Culturama 2026'. Looking for something modern, vibrant, and youth-focused.\n\nRequirements:\n- Must include event name\n- Should work in color and B&W\n- Deliver in multiple formats (PNG, SVG, AI)", "category_id": 1, "client_id": 7, "budget": 500, "delivery_days": 3, "requirements": "Experience in event branding preferred", "deliverables": "Logo in 3 variations + source files", "status": GigStatus.OPEN},
        
        {"title": "Build a Responsive Landing Page", "description": "Looking for a developer to create a beautiful landing page for our startup.\n\nTech stack: React + Tailwind CSS\nMust be mobile-responsive and fast loading.\n\nWe'll provide the design in Figma.", "category_id": 2, "client_id": 6, "budget": 1000, "delivery_days": 5, "requirements": "React experience required", "deliverables": "Fully functional landing page deployed on Vercel", "status": GigStatus.OPEN},
        
        {"title": "Write a Blog Article (800-1000 words)", "description": "Need a well-researched blog post on 'Top 10 Study Tips for College Students'.\n\nMust be engaging, SEO-optimized, and include relevant examples.\n\nTopic will be provided.", "category_id": 3, "client_id": 8, "budget": 300, "delivery_days": 2, "requirements": "Native English writing skills", "deliverables": "Google Doc with article", "status": GigStatus.OPEN},
        
        {"title": "Edit a 2-minute Promotional Video", "description": "We have raw footage from our college fest. Need someone to edit it into a catchy 2-minute promo video.\n\nMust include:\n- Smooth transitions\n- Background music\n- Text overlays\n- Color grading", "category_id": 4, "client_id": 7, "budget": 600, "delivery_days": 4, "requirements": "Adobe Premiere Pro or DaVinci Resolve", "deliverables": "Final video in 1080p MP4", "status": GigStatus.OPEN},
        
        {"title": "Data Analysis in Excel", "description": "Have a dataset of 5000+ survey responses. Need help with:\n- Data cleaning\n- Pivot tables\n- Charts and visualizations\n- Summary report\n\nPerfect for someone studying statistics or data science!", "category_id": 6, "client_id": 6, "budget": 700, "delivery_days": 3, "requirements": "Advanced Excel skills", "deliverables": "Cleaned dataset + analysis report", "status": GigStatus.OPEN},
        
        {"title": "Social Media Post Designs (5 posts)", "description": "Looking for a designer to create 5 Instagram posts for our product launch.\n\nStyle: Modern, minimalist, on-brand\nWe'll provide brand guidelines and copy.", "category_id": 1, "client_id": 8, "budget": 400, "delivery_days": 3, "requirements": "Figma or Canva expertise", "deliverables": "5 Instagram posts (1080x1080)", "status": GigStatus.OPEN},
        
        {"title": "Help with Python Assignment", "description": "Need help understanding and completing a Python data structures assignment.\n\nTopics: Lists, dictionaries, file handling\n\nLooking for someone who can explain concepts clearly, not just do the work!", "category_id": 2, "client_id": 6, "budget": 800, "delivery_days": 2, "requirements": "Strong Python fundamentals", "deliverables": "Completed code + explanations", "status": GigStatus.OPEN},
        
        {"title": "UI Mockup for Mobile App", "description": "Need a UI/UX designer to create mockups for a student productivity app.\n\nApproximately 8-10 screens.\nMust be in Figma with proper component structure.", "category_id": 1, "client_id": 6, "budget": 900, "delivery_days": 5, "requirements": "Figma expertise, mobile design experience", "deliverables": "Figma file with all screens", "status": GigStatus.OPEN},
    ]

    gigs = []
    for gig_data in gigs_data:
        gig = Gig(**gig_data)
        db.add(gig)
        gigs.append(gig)
    db.commit()

    # ============ APPLICATIONS (Demo) ============
    applications_data = [
        {"gig_id": 1, "freelancer_id": 1, "proposed_price": 500, "delivery_days": 3, "cover_letter": "Hi! I'd love to design your logo. I have experience with event branding and can deliver multiple concepts. Check my portfolio!", "status": ApplicationStatus.PENDING},
        {"gig_id": 1, "freelancer_id": 3, "proposed_price": 450, "delivery_days": 2, "cover_letter": "I can create a stunning logo for your fest! I've done similar work before.", "status": ApplicationStatus.PENDING},
        {"gig_id": 2, "freelancer_id": 2, "proposed_price": 1000, "delivery_days": 5, "cover_letter": "Perfect match! I specialize in React + Tailwind. Let's build something amazing!", "status": ApplicationStatus.ACCEPTED},
        {"gig_id": 3, "freelancer_id": 3, "proposed_price": 300, "delivery_days": 2, "cover_letter": "I'm a content writer with SEO expertise. Happy to write this article!", "status": ApplicationStatus.PENDING},
        {"gig_id": 5, "freelancer_id": 5, "proposed_price": 700, "delivery_days": 3, "cover_letter": "Data analysis is my strength! I can clean, analyze, and visualize your data efficiently.", "status": ApplicationStatus.PENDING},
    ]

    applications = []
    for app_data in applications_data:
        app = Application(**app_data)
        db.add(app)
        applications.append(app)
    db.commit()

    # ============ CONTRACTS ============
    contracts_data = [
        {"gig_id": 2, "application_id": 3, "client_id": 6, "freelancer_id": 2, "agreed_budget": 1000, "delivery_deadline": datetime.utcnow() + timedelta(days=5), "status": ContractStatus.ACTIVE},
    ]

    contracts = []
    for contract_data in contracts_data:
        contract = Contract(**contract_data)
        db.add(contract)
        contracts.append(contract)
    db.commit()

    print("✅ Database seeded successfully!")
    print("\n📊 Summary:")
    print(f"   - {len(categories)} categories")
    print(f"   - {len(skills)} skills")
    print(f"   - {len(users)} users (5 students, 3 clients)")
    print(f"   - {len(profiles)} profiles")
    print(f"   - {len(gigs)} gigs")
    print(f"   - {len(applications)} applications")
    print(f"   - {len(contracts)} contracts")
    
    print("\n🔐 Demo Credentials:")
    print("   Student: student1@college.edu / password123")
    print("   Client: client1@startup.com / password123")

except Exception as e:
    print(f"❌ Error seeding database: {e}")
    db.rollback()
finally:
    db.close()