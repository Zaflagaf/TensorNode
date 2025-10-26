# TENSORNODE

### The Visual Workflow of Artificial Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org/) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-blueviolet?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/) [![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20-orange?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/) [![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://www.python.org/) [![Node.js](https://img.shields.io/badge/Node.js-22.14-green?logo=node.js&logoColor=white)](https://nodejs.org/) [![Blender](https://img.shields.io/badge/Blender-Inspired-orange?logo=blender&logoColor=white)](https://www.blender.org/) [![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> _From Complexity to Simplicity_

Tensornode is more than just an application: it is the culmination of a passion for artificial intelligence and the desire to make AI accessible to everyone. Designed to meet the growing demand for machine learning, it provides an environment where creating, training, and deploying your own AI becomes intuitive, visual, and immediate.

The web interface, ergonomically designed, transforms complexity into simplicity: all the intricate logic is encapsulated, allowing the user to focus on exploration and innovation without writing a single line of code. The workflow is inspired by Blender’s nodes & edges graphs, offering an elegant and structured graphical representation of neural networks and learning processes.

With Tensornode, the boundary between advanced technology and human creativity blurs: the user becomes the architect of their AI, guided by an intelligent interface that transforms algorithmic complexity into a smooth, aesthetic, and deeply intuitive experience.

---

## Features

- Build, train, and deploy AI models visually without coding.
- Graph-based workflow inspired by Blender nodes & edges.
- Fully web-based, intuitive, and ergonomic interface.
- Backend logic encapsulated for simplicity and efficiency.
- Supports Python AI frameworks natively.

---

## Prerequisites

Make sure you have installed:

- Python 3.x
- Node.js & npm
- Docker Desktop (optional but recommended)
- Visual Studio Code (recommended)

---

## Installation

### Clone the repository

```
git clone https://github.com/Zaflagaf/TensorNode.git
cd TensorNode
```

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

Open a new terminal:

```
cd backend
python -m venv venv          # optional, recommended
source venv/bin/activate     # Linux/macOS
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn api.main:sio_app --reload
```

---

## Usage

- **Frontend** → [http://localhost:3000](http://localhost:3000)
- **Backend API** → [http://localhost:8000/api](http://localhost:8000/api)

You can configure these URLs in the `.env.local` file at the root of the project to match your setup.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
