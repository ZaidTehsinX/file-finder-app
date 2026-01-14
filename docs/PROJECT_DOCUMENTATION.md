# File Finder - Project Documentation

## 📋 Project Overview

**File Finder** is a modern, full-stack web application that allows users to search for files across their entire file system recursively. Whether you're looking for documents, images, videos, audio files, or any other file type, File Finder makes it easy to locate them quickly with an intuitive interface.

---

## 🎯 Purpose

The purpose of File Finder is to:
- **Quickly locate files** across deep folder hierarchies without manual browsing
- **Search all file types** (documents, images, videos, audio, archives, etc.)
- **Display organized results** showing which folders contain your files
- **Provide a modern UI** with smooth animations and responsive design
- **Store scan history** in a database for faster subsequent searches

---

## 🛠️ Technologies Used

### **Frontend Stack**
- **React 18.2.0** - UI library for building interactive components
- **TypeScript 5.3.3** - Adds type safety to JavaScript
- **Vite 7.3.1** - Fast development server and build tool
- **CSS3** - Modern styling with gradients, animations, and flexbox
- **Tailwind CSS** - Utility-first CSS framework (referenced)

### **Backend Stack**
- **Node.js** - JavaScript runtime for server
- **Express.js 4.18.2** - Web framework for REST API
- **SQLite3** - Lightweight database for storing scan results
- **File System APIs** - Native Node.js modules for file operations

### **Development Tools**
- **Git** - Version control
- **npm** - Package manager
- **CORS** - Enable cross-origin requests between frontend and backend

---

## 📱 Frontend - What It Does

The frontend is a React web application that provides the user interface for File Finder.

### **Main Features:**

1. **Animated Header**
   - Eye-catching "File Finder" title with gradient animations
   - Purple-to-blue color transitions with glowing shadow effects
   - Smooth fade-in animations on page load

2. **Search Form**
   - Text input for entering filename or search pattern
   - Folder selection modal with drive browsing
   - Support for all file types (documents, images, videos, audio, etc.)

3. **Folder Browser Modal**
   - Lists all available drives (C:\, D:\, E:\, etc.)
   - Navigate through folder hierarchy
   - Manual path input for quick access
   - Excludes hidden folders (like .git, .node_modules)

4. **Results Display**
   - Shows folders grouped by whether they contain search results
   - Color-coded filters: "With Results" and "Without Results"
   - Expandable file items showing filename, size, and full path
   - Scrollable container with custom gradient scrollbar

5. **Loading Animation**
   - Animated spinner while backend scans folders
   - Shows progress message to user

6. **Footer**
   - Creator attribution: "Created by Zaid Tehsin"
   - Tech stack icons (React, TypeScript, Tailwind, Node.js, Express, SQLite)
   - Modern glassmorphism design with backdrop blur

### **Components:**
- `AnimatedHeading.tsx` - Title with gradient animations
- `SearchForm.tsx` - Input form and folder selector
- `FolderBrowser.tsx` - Drive and folder navigation
- `ResultsDisplay.tsx` - Search results display with filters
- `LoadingAnimation.tsx` - Loading spinner
- `Footer.tsx` - Footer with credits and tech stack

---

## 🔧 Backend - What It Does

The backend is a Node.js Express server that handles all file scanning, searching, and database operations.

### **Main Responsibilities:**

1. **API Endpoints**
   - `GET /api/drives` - Returns list of available Windows drives
   - `POST /api/list-dirs` - Lists subdirectories in a given folder
   - `POST /api/scan` - Initiates recursive folder scan and stores in database
   - `POST /api/search` - Searches database for matching files

2. **File Scanning**
   - Recursively traverses all folders starting from user-selected path
   - Reads all file metadata (name, size, extension, path)
   - Excludes hidden folders starting with "." (like .git, .vscode)
   - Stores every scanned folder in database regardless of contents

3. **Database Management**
   - Creates and maintains SQLite database with scan history
   - Stores `scans` table with folder path and scan date
   - Stores `files` table with complete file information
   - Stores `folders` table with all scanned folders
   - Allows fast searching across previous scans

4. **Search & Retrieval**
   - Performs case-insensitive filename matching using LIKE queries
   - Groups results by folder
   - Returns both folders with matches and folders without matches
   - Provides detailed statistics (total folders, files found, etc.)

### **File Scanning Process:**
```
1. User selects folder and enters search term
2. Backend starts recursive scan of selected folder
3. All files and folders are cataloged and stored in database
4. Frontend receives scan completion status
5. Backend searches database for matching filenames
6. Results grouped by folder are returned to frontend
7. Frontend displays organized results with filters
```

### **Database Schema:**
- **scans table**: Stores scan sessions with timestamps
- **files table**: Stores file metadata with reference to scan
- **folders table**: Stores all folder paths visited during scan

---

## 🚀 How It Works - User Flow

1. **User opens the application**
   - Frontend loads with animated title and search form

2. **User selects a folder**
   - Clicks "Select Folder to Search"
   - Navigates through drives and folders in modal
   - Clicks folder to select it

3. **User enters search term**
   - Types filename or pattern (e.g., "photo", "invoice", "document")
   - Can be partial match (searches anywhere in filename)

4. **User initiates search**
   - Clicks search button or presses Enter
   - Frontend shows loading animation

5. **Backend scans folder**
   - Recursively visits every folder in selected path
   - Records all files and folders in database
   - Logs detailed scan information to console

6. **Backend searches database**
   - Queries for files matching search term
   - Groups results by folder location

7. **Results display**
   - Frontend shows folders organized into two categories:
     - **With Results**: Folders containing matching files
     - **Without Results**: Scanned folders without matches
   - User can toggle filter buttons to view specific categories
   - Can expand folders to see found files with details

8. **User can refine search**
   - New search reuses existing scan from database
   - Results appear instantly without re-scanning

---

## 📊 Key Features

✅ **Recursive Search** - Searches all subfolders automatically  
✅ **All File Types** - Documents, images, videos, audio, archives, and more  
✅ **Modern UI** - Smooth animations, gradients, responsive design  
✅ **Database Persistence** - Previous scans stored for faster results  
✅ **Smart Filtering** - Toggle between folders with/without results  
✅ **Hidden Folder Exclusion** - Ignores system/hidden folders  
✅ **Drive Enumeration** - Works across all available drives  
✅ **Folder Organization** - Results clearly grouped by location  

---

## 🔧 Setup & Running

### **Prerequisites**
- Node.js installed
- npm (Node Package Manager)

### **Installation**
```bash
cd "File Finder"
npm install
```

### **Running the Application**
```bash
# Terminal 1 - Start Backend (Port 3001)
npm run dev:server

# Terminal 2 - Start Frontend (Port 5173)
npm run dev
```

### **Building for Production**
```bash
npm run build
```

---

## 📝 Project Structure

```
File Finder/
├── src/
│   ├── components/          # React components
│   │   ├── AnimatedHeading.tsx
│   │   ├── SearchForm.tsx
│   │   ├── FolderBrowser.tsx
│   │   ├── ResultsDisplay.tsx
│   │   ├── LoadingAnimation.tsx
│   │   └── Footer.tsx
│   ├── App.tsx              # Main app component
│   └── main.tsx             # React entry point
├── server/
│   ├── index.js             # Express server & API endpoints
│   ├── fileScanner.js       # File scanning logic
│   └── db.js                # SQLite database setup
├── docs/                    # Documentation folder
│   └── PROJECT_DOCUMENTATION.md
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
└── file-finder.db           # SQLite database (auto-generated)
```

---

## 🎨 Design Highlights

- **Purple-Blue Gradient Theme** - Modern color scheme throughout
- **Animated Title** - Gradient and glow effects with smooth transitions
- **Glassmorphism Footer** - Modern frosted glass effect
- **Color-Coded Results** - Visual distinction between match types
- **Smooth Scrollbar** - Gradient-styled custom scrollbar
- **Responsive Layout** - Works on desktop and tablet

---

## 💡 Technical Highlights

- **Recursive File System Traversal** - Efficiently scans deep folder hierarchies
- **Database Indexing** - Fast queries on large scan results
- **Case-Insensitive Search** - User-friendly search matching
- **CORS Enabled** - Frontend-backend communication works smoothly
- **Error Handling** - Graceful handling of permission issues and missing files
- **Type Safety** - TypeScript prevents runtime errors

---

## 🔄 API Reference

### `GET /api/drives`
Returns list of available Windows drives
```json
{ "drives": ["C:\\", "D:\\", "E:\\"] }
```

### `POST /api/list-dirs`
Lists subdirectories in a folder
```json
Request: { "folderPath": "C:\\Users" }
Response: { "subDirs": ["Desktop", "Documents", "Downloads"] }
```

### `POST /api/scan`
Scans a folder recursively
```json
Request: { "folderPath": "C:\\Users\\Documents" }
Response: { "success": true, "message": "Scan complete: 1500 files found" }
```

### `POST /api/search`
Searches for files in a scanned folder
```json
Request: { "folderPath": "C:\\Users\\Documents", "searchTerm": "photo" }
Response: {
  "foldersWithFile": [...],
  "foldersWithoutFile": [...],
  "totalFilesFound": 5
}
```

---

## 📄 License

Created by Zaid Tehsin

---

## 🤝 Technologies Working Together

**How Frontend & Backend Communicate:**

1. Frontend sends REST requests to backend API
2. Backend processes file system operations
3. Backend stores results in SQLite database
4. Backend returns organized results to frontend
5. Frontend displays results with interactive filters
6. User can refine searches using cached database results

This architecture provides:
- **Speed** - Database caching for fast repeated searches
- **Reliability** - Proper error handling on both sides
- **Scalability** - Can handle large folder structures
- **User Experience** - Responsive UI with instant feedback

---

## ✨ Future Enhancements

- Export search results to CSV
- File preview functionality
- Search history
- Advanced filters (file size, date, type)
- Dark mode toggle
- Bulk file operations
- Network drive support

---

**For more information or support, check the code comments in respective component files.**
