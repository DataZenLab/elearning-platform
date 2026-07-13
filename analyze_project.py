import os
import re
import json
from collections import defaultdict

PROJECT_ROOT = r"c:\Users\dangd\.gemini\antigravity-ide\scratch\elearning-platform"
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
DOCS_DIR = os.path.join(PROJECT_ROOT, "docs")

if not os.path.exists(DOCS_DIR):
    os.makedirs(DOCS_DIR)

class FileInfo:
    def __init__(self, filepath):
        self.filepath = filepath
        self.rel_path = os.path.relpath(filepath, PROJECT_ROOT).replace("\\", "/")
        self.file_type = self._determine_type()
        self.imports = []
        self.exports = []
        self.called_by = [] # List of rel_paths
        self.calls = [] # List of rel_paths
        self.importance = "Medium"
        self.functionality = ""
        self.content = ""
        
    def _determine_type(self):
        p = self.rel_path
        if "src/components" in p: return "React Component"
        if "src/app" in p and "page.tsx" in p: return "NextJS Page"
        if "src/app" in p and "layout.tsx" in p: return "NextJS Layout"
        if "src/actions" in p: return "Server Action"
        if "src/hooks" in p: return "Custom Hook"
        if "src/services" in p: return "Service / API"
        if "src/stores" in p: return "State Store"
        if "src/providers" in p: return "Context Provider"
        if "src/lib" in p: return "Utility"
        if "src/types" in p: return "Type Definition"
        return "Script / Configuration"
        
    def infer_importance_and_func(self):
        if self.file_type == "NextJS Page" or self.file_type == "NextJS Layout":
            self.importance = "High"
            self.functionality = f"Hiển thị giao diện màn hình cho route tương ứng: {os.path.dirname(self.rel_path)}"
        elif self.file_type == "Service / API":
            self.importance = "Critical"
            self.functionality = "Cung cấp các hàm giao tiếp trực tiếp với Backend (Strapi/Firebase) để lấy và thao tác dữ liệu."
        elif self.file_type == "Server Action":
            self.importance = "Critical"
            self.functionality = "Thực thi các tác vụ bảo mật trên Server (Form submission, mutations) và revalidate cache."
        elif self.file_type == "React Component":
            self.importance = "Medium"
            self.functionality = "Thành phần giao diện tái sử dụng được (UI Component)."
        elif self.file_type == "State Store":
            self.importance = "High"
            self.functionality = "Quản lý trạng thái toàn cục (Global State) của ứng dụng bằng Zustand."
        elif self.file_type == "Custom Hook":
            self.importance = "Medium"
            self.functionality = "Đóng gói các logic React dùng lại nhiều lần ở phía Client."
        else:
            self.functionality = "Cung cấp các hàm hoặc dữ liệu hỗ trợ cấu trúc của hệ thống."

files_db = {}
import_map = defaultdict(list)

def parse_files():
    for root, dirs, files in os.walk(PROJECT_ROOT):
        if "node_modules" in root or ".next" in root or ".git" in root or "docs" in root:
            continue
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                filepath = os.path.join(root, file)
                info = FileInfo(filepath)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        info.content = f.read()
                        
                    # Extract imports (very basic regex for `import { X } from 'path'`)
                    import_pattern = r'import\s+.*?\s+from\s+[\'"](.*?)[\'"]'
                    imports = re.findall(import_pattern, info.content)
                    for imp in imports:
                        # Normalize alias mapping @/ -> src/
                        norm_imp = imp.replace('@/', 'src/')
                        info.imports.append(norm_imp)
                        
                    # Extract exports
                    export_pattern = r'export\s+(?:async\s+)?(?:default\s+)?(?:function|const|class)\s+([A-Za-z0-9_]+)'
                    info.exports = re.findall(export_pattern, info.content)
                    
                    info.infer_importance_and_func()
                    files_db[info.rel_path] = info
                except Exception as e:
                    pass

def build_graph():
    # Link callers and calls based on import paths
    rel_paths = list(files_db.keys())
    for rel, info in files_db.items():
        for imp in info.imports:
            # Find which actual file this matches
            for target_rel in rel_paths:
                if imp in target_rel:
                    info.calls.append(target_rel)
                    files_db[target_rel].called_by.append(rel)

def generate_00_overview():
    content = """# Tổng quan hệ thống (Project Overview)

## Ngữ cảnh
Đây là hệ thống E-Learning Platform được xây dựng dựa trên kiến trúc hiện đại (Modern Stack). Hệ thống bao gồm Frontend xử lý giao diện cho học viên, giảng viên và quản trị viên, kết hợp với các dịch vụ Backend để xử lý dữ liệu và xác thực.

## Công nghệ cốt lõi
- **Framework Frontend**: Next.js (App Router)
- **Styling**: TailwindCSS & shadcn/ui
- **Quản lý State**: Zustand, React Query
- **Authentication**: Firebase Authentication (Email, Google)
- **Database / Tiến trình học tập**: Firebase Firestore
- **Lưu trữ Tệp tin**: Firebase Storage
- **CMS / Dữ liệu khóa học**: Strapi Headless CMS (REST API)

## Kiến trúc chính
Hệ thống sử dụng mô hình BFF (Backend-for-Frontend) thông qua Next.js Server Actions. Client sẽ gọi Server Actions hoặc Custom Hooks, từ đó giao tiếp với các tầng Services (gọi lên Firebase hoặc Strapi).
"""
    with open(os.path.join(DOCS_DIR, "00_PROJECT_OVERVIEW.md"), "w", encoding="utf-8") as f:
        f.write(content)

def generate_01_folder_structure():
    content = """# Cấu trúc thư mục (Folder Structure)

```text
elearning-platform/
├── strapi/                 # Backend Headless CMS quản lý nội dung tĩnh (Video, Bài học)
├── public/                 # Tài nguyên hình ảnh tĩnh
├── src/
│   ├── actions/            # Server Actions (Logic chạy trên môi trường Node.js Server)
│   ├── app/                # Next.js App Router (Định tuyến và cấu hình Layout)
│   ├── components/         # Các khối UI (Giao diện) tái sử dụng
│   ├── hooks/              # Custom React Hooks (Client logic)
│   ├── lib/                # Cấu hình Firebase, Strapi client và Utils
│   ├── providers/          # React Context (Auth, Theme, Query)
│   ├── services/           # Xử lý gọi API tới Strapi và Firebase Firestore
│   ├── stores/             # Global State Management (Zustand)
│   └── types/              # Khai báo kiểu dữ liệu TypeScript
└── docs/                   # Tài liệu kiến trúc dự án
```
"""
    with open(os.path.join(DOCS_DIR, "01_FOLDER_STRUCTURE.md"), "w", encoding="utf-8") as f:
        f.write(content)

def generate_02_file_docs():
    content = "# Phân tích chi tiết từng file\n\n"
    content += "Tài liệu này liệt kê phân tích chi tiết của toàn bộ file trong hệ thống.\n\n"
    
    for rel_path, info in files_db.items():
        if not info.exports and "layout.tsx" not in rel_path and "page.tsx" not in rel_path and "src/" in rel_path:
            continue
            
        content += f"## `{rel_path}`\n\n"
        content += f"- **Loại file**: `{info.file_type}`\n"
        content += f"- **Độ quan trọng**: `{info.importance}`\n\n"
        
        content += "### 🎯 Chức năng\n"
        content += f"{info.functionality}\n\n"
        
        content += "### 🛠 Các hàm chính\n"
        if info.exports:
            content += "| Tên hàm | Nhiệm vụ | Input | Output |\n"
            content += "|---|---|---|---|\n"
            for exp in info.exports:
                content += f"| `{exp}` | Xử lý logic nghiệp vụ | `params/data` | `Promise / UI / State` |\n"
            content += "\n"
        else:
            content += "_Không có export hàm cụ thể (File tĩnh hoặc khai báo thuần)._\n\n"
            
        content += "### 🔗 Liên kết\n"
        
        content += "**Dependencies (Import từ):**\n"
        if info.imports:
            for imp in info.imports:
                content += f"- `{imp}`\n"
        else:
            content += "- _Không import module ngoài_\n"
        content += "\n"
        
        content += "**Ai gọi file này:**\n"
        if info.called_by:
            for c in list(set(info.called_by)):
                content += f"- `{c}`\n"
        else:
            content += "- _Chưa tìm thấy caller cụ thể_\n"
        content += "\n"
        
        content += "**File này gọi ai:**\n"
        if info.calls:
            for c in list(set(info.calls)):
                content += f"- `{c}`\n"
        else:
            content += "- _Không gọi file nội bộ khác_\n"
        content += "\n"
        
        content += "### 🌊 Luồng dữ liệu (Mẫu)\n"
        content += "```mermaid\n"
        content += "flowchart TD\n"
        content += f"  A[Trigger / User] --> B[{os.path.basename(rel_path)}]\n"
        if info.calls:
            content += f"  B --> C[{os.path.basename(info.calls[0])}]\n"
            content += "  C --> D[(Database / API)]\n"
        else:
            content += "  B --> D[(End state / Render)]\n"
        content += "```\n\n"
        content += "---\n\n"
        
    with open(os.path.join(DOCS_DIR, "02_FILE_DOCUMENTATION.md"), "w", encoding="utf-8") as f:
        f.write(content)

def generate_flows():
    # Write mermaid diagrams
    
    # 09 Data flow
    data_flow = """# Luồng dữ liệu tổng quát (Data Flow)

```mermaid
flowchart TD
    User([Học viên / Giảng viên])
    UI[Next.js Pages & Components]
    Actions[Server Actions]
    Hooks[Custom Hooks & Stores]
    FirebaseService[Firebase Services]
    StrapiService[Strapi Services]
    Firestore[(Firebase Firestore)]
    StrapiDB[(Strapi CMS)]

    User -- "Tương tác giao diện" --> UI
    UI -- "Gọi state/API client" --> Hooks
    UI -- "Gửi form/Mutation" --> Actions
    
    Hooks -- "Read/Write" --> FirebaseService
    Hooks -- "Fetch data" --> StrapiService
    
    Actions -- "Bảo mật DB" --> FirebaseService
    Actions -- "Tạo content" --> StrapiService
    
    FirebaseService -- "CRUD Tiến trình, Auth" --> Firestore
    StrapiService -- "Lấy bài giảng" --> StrapiDB
```
"""
    with open(os.path.join(DOCS_DIR, "09_DATA_FLOW.md"), "w", encoding="utf-8") as f:
        f.write(data_flow)

    # 10 Auth flow
    auth_flow = """# Luồng xác thực (Authentication Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Page
    participant AS as Auth Service
    participant FB as Firebase Auth
    participant FS as Firestore (Profile)

    U->>UI: Nhập Email/Password & Bấm Đăng nhập
    UI->>AS: loginWithEmail(credentials)
    AS->>FB: signInWithEmailAndPassword()
    FB-->>AS: Trả về userCredential
    AS->>FS: getOrCreateUserProfile(uid)
    FS-->>AS: Trả về Role (student, instructor, admin)
    AS-->>UI: Đăng nhập thành công
    UI-->>U: Chuyển hướng vào Dashboard tương ứng
```
"""
    with open(os.path.join(DOCS_DIR, "10_AUTH_FLOW.md"), "w", encoding="utf-8") as f:
        f.write(auth_flow)

    # 11 API flow
    api_flow = """# Luồng gọi API (API Flow)

```mermaid
sequenceDiagram
    participant UI as Course Detail Page
    participant Service as Courses API Service
    participant CMS as Strapi CMS

    UI->>Service: getCourseBySlug(slug)
    Service->>CMS: GET /api/courses?filters[slug]=...
    CMS-->>Service: JSON (Course Data + Lessons)
    Service-->>UI: Trả về Object đã format
    UI-->>UI: Render Component & Truyền props
```
"""
    with open(os.path.join(DOCS_DIR, "11_API_FLOW.md"), "w", encoding="utf-8") as f:
        f.write(api_flow)
        
def generate_summary():
    content = "# Bảng Thống Kê Tổng Hợp Dự Án\n\n"
    content += "| File | Loại File | Chức năng (Tóm tắt) | Độ quan trọng |\n"
    content += "|---|---|---|---|\n"
    
    for rel_path, info in files_db.items():
        if "src/" in rel_path and ("page" in rel_path or "layout" in rel_path or "action" in rel_path or "service" in rel_path or "store" in rel_path):
            func_short = info.functionality[:50] + "..." if len(info.functionality) > 50 else info.functionality
            content += f"| `{rel_path}` | {info.file_type} | {func_short} | {info.importance} |\n"
            
    with open(os.path.join(DOCS_DIR, "14_PROJECT_SUMMARY.md"), "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    print("Parsing files...")
    parse_files()
    print("Building graph...")
    build_graph()
    print("Generating documentation...")
    generate_00_overview()
    generate_01_folder_structure()
    generate_02_file_docs()
    generate_flows()
    generate_summary()
    print("Docs generation complete!")
