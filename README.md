# Terminal based AI Coding Agent

A powerful AI-powered coding assistant that helps developers build and manage projects across various tech stacks. The agent can understand natural language requests, execute commands, manage files, and provide intelligent assistance throughout the development process.

## Features

- **Multi-Stack Support**: Works with MERN, Flask, Django, and HTML/CSS/JS stacks
- **AI Integration**: Supports both OpenAI and Gemini AI models
- **File Management**: Comprehensive file and directory operations
- **Command Execution**: Run shell commands and manage processes
- **Interactive Feedback**: Get user input when needed
- **Session Management**: Maintains state between runs
- **Project Scaffolding**: Creates appropriate directory structures for different tech stacks

## Available Tools

The agent comes with a rich set of tools for various operations:

### File Operations

- `write_file`: Write content to files
- `read_file`: Read file contents
- `delete_file`: Remove files
- `copy_file`: Copy files
- `move_file`: Move files
- `check_file_exists`: Verify file existence
- `get_file_info`: Get file metadata

### Directory Operations

- `list_files`: List directory contents
- `create_directory`: Create new directories
- `delete_directory`: Remove directories

### System Operations

- `run_command`: Execute shell commands
- `ask_user_for_feedback`: Get user input

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key or Gemini API key
- Git (optional)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd 3.ai-agent
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:

```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## Usage

1. Start the agent:

```bash
npm start
```

2. Follow the interactive prompts to:

   - Select your preferred AI model (OpenAI or Gemini)
   - Choose your tech stack
   - Specify project details
   - Add features and functionality

3. The agent will:
   - Create appropriate directory structures
   - Generate necessary files
   - Execute commands
   - Provide guidance and feedback

## Project Structure

```
.
├── core/           # Core agent functionality
├── tools/          # Available tools and utilities
├── stacks/         # Stack-specific configurations
├── PROJECTS/       # Generated projects
├── index.js        # Main entry point
└── package.json    # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License

## Support

For support, please open an issue in the repository or contact the maintainers.

## Acknowledgments

- OpenAI for their powerful language models
- Google for Gemini AI
- The open-source community for various tools and libraries
