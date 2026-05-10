# BuilderPad

A React application powered by Gemini AI, built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🚀 Built with Vite for fast development
- ⚛️ React 19 with TypeScript
- 🎨 Tailwind CSS for styling
- 🤖 Gemini AI integration
- 📱 Responsive design
- 🔄 React Router for navigation
- 📝 Notes management with Markdown support
- 📋 Phase tracking for project milestones
- ✅ To-do lists for task management
- 📁 File uploads and management
- 🔐 Secure credentials storage for API keys and login details
- 🔗 Project sharing capabilities
- 📊 Interactive flowchart & diagram builder with drag-and-drop nodes

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

## Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd builderpad
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Gemini API key to `.env.local`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     APP_URL=http://localhost:3000
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`: Your Gemini API key
4. Deploy!

Vercel will automatically detect the Vite configuration and deploy your app.

## Environment Variables

- `GEMINI_API_KEY` (required): Your Gemini API key for AI features
- `APP_URL` (optional): The URL where your app is hosted

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run clean` - Clean build directory

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini AI
- **Routing:** React Router
- **State Management:** LocalForage for persistence
- **Diagrams:** React Flow for interactive flowcharts

## Diagram Builder

The integrated diagram builder allows you to create:

- **Flowcharts** - Map out application logic and user flows
- **Architecture Diagrams** - Visualize system components and their relationships
- **Process Flows** - Document workflows and business processes
- **Decision Trees** - Plan conditional logic and branching paths

### Node Types:
- 🟢 **Start/End** - Oval nodes for flow entry/exit points
- 🔵 **Process** - Rectangle nodes for actions and operations
- 🟡 **Decision** - Diamond nodes for conditional branching
- 🟠 **Note** - Dashed boxes for comments and annotations

### Features:
- Drag and drop nodes to reposition
- Connect nodes with arrows to show flow
- Pan and zoom to navigate large diagrams
- Auto-save to local storage
- Export diagrams (coming soon)

## License

MIT
