# Personal Library Management System Frontend (PLMS)

## Course Information
**Course:** CSE443 – Object Oriented Analysis & Design  
**University:** Gebze Technical University (GTU)  
**Semester:** Fall 2025  
**Project Type:** Term Project  
**Group Members:**  
- Ahmet Mücahit Gündüz
- Enes Korkmaz
- Onurhan Talan 
- Rümeysa Kalay
- Veysel Cemaloğlu

---

## 1. Introduction
In today’s digital age, personal collections of books and DVDs often grow beyond manual management, leading to lost items, duplicates, and inefficient tracking. The **Personal Library Management System (PLMS)** addresses these challenges by offering a centralized, intelligent platform for cataloging, enriching, and monitoring personal media collections.

The PLMS allows users to efficiently manage their physical media inventory, connect with external internet resources for metadata enrichment, and track their reading or viewing progress through an intuitive interface.

---

## 2. Objectives
The system aims to:
- Maintain an organized inventory of physical books and DVDs.
- Fetch metadata, summaries, and reviews automatically using APIs such as Google Books or IMDb.
- Allow customizable reading and viewing lists.
- Track progress for books (pages, chapters) and DVDs (runtime, scenes).
- Support user accounts, synchronization, and secure data storage across devices.

---

## 3. Core Functional Requirements

### 3.1 Inventory Management
- CRUD operations on media items.  
- Add via manual entry or barcode/ISBN scanning.  
- Search, filter, and categorize items by type, genre, or tags.  
- Update conditions and loan status.

### 3.2 Internet Resource Mapping
- Integration with external APIs (Google Books, Open Library, IMDb).  
- Fetch enriched metadata, author/director info, reviews, and summaries.  
- Synchronize updates from external sources.

### 3.3 Reading/Viewing Lists
- Create, edit, and delete custom lists (e.g., *To Read*, *Favorites*, *Watch Later*).  
- Sort and prioritize items based on user preferences.

### 3.4 Progress Tracking
- Track progress for books and DVDs individually.  
- Record history of sessions, durations, and completion percentages.  
- Display visual progress indicators and optional notifications.

### 3.5 User Profiles and Multi-Device Access
- User registration, authentication, and password management.  
- Sync personal data across desktop and mobile clients.  
- Ensure secure transmission and storage of personal data.
