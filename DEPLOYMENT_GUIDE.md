
# 🚀 Deployment Guide: Arcade AI

You have a complete multi-game platform ready to launch.
This guide explains how to deploy it to a cheap VPS (Virtual Private Server) like DigitalOcean, Linode, or Railway.

## 📦 What You Have
1.  **Connect Four**:
    *   API (Python/FastAPI) on Port 8001
    *   Frontend (React) on Port 5173
2.  **Infinity Word**:
    *   API (Python/FastAPI) on Port 8002
    *   Frontend (React) on Port 5175
3.  **Arcade Hub**:
    *   Landing Page on Port 8080

## 🛠 Option 1: The "Lazy" Way (Railway/Render)
1.  Upload your entire `d:\AI_Apps` folder to GitHub.
2.  Connect Railway.app to your GitHub.
3.  Railway will detect the `docker-compose.yml` and deploy everything automatically.
4.  You will get a public URL for each service.

## 🛠 Option 2: The "Pro" Way (VPS + Docker)
1.  **Rent a Server**: Get a $5/mo Ubuntu Droplet from DigitalOcean.
2.  **Install Docker**:
    ```bash
    sudo apt update
    sudo apt install docker.io docker-compose
    ```
3.  **Upload Code**:
    *   Use FileZilla (SFTP) to upload the `AI_Apps` folder to `/root/AI_Apps`.
4.  **Run It**:
    ```bash
    cd /root/AI_Apps
    docker-compose up -d --build
    ```
5.  **Go Live**:
    *   Your Hub will be at `http://YOUR_SERVER_IP:8080`.

## ⏭ Next Steps
*   Buy a domain (e.g., `www.ArcadeAI.com`).
*   Point domain to your server IP.
*   Start marketing Game #2 (Infinity Word) on Reddit/TikTok.

-- Agentic Eve
