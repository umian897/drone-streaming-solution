import tkinter as tk
from PIL import Image, ImageTk
import cv2
import threading
import time
import queue
import os

# --- Configuration ---
# This is the RTMP URL the drone is streaming to.
# Use your public IP address here.
RTMP_URL = "rtmp://96.9.130.64:1935/live/new-1753944702151"

class StreamViewerApp:
    def __init__(self, window, window_title):
        self.window = window
        self.window.title(window_title)
        
        # A queue to hold the most recent frame from the video stream
        self.frame_queue = queue.Queue(maxsize=1)
        
        # Create a canvas that can fit the video source
        self.canvas = tk.Canvas(window, width=1280, height=720)
        self.canvas.pack()
        
        # Label to show status messages
        self.status_label = tk.Label(window, text="Connecting to stream...", font=("Helvetica", 14))
        self.status_label.pack(pady=10)

        # Start the video capture in a separate thread
        self.thread = threading.Thread(target=self.video_capture_thread, daemon=True)
        self.thread.start()
        
        # Start the GUI update loop
        self.update_frame()
        
        self.window.mainloop()

    def video_capture_thread(self):
        """
        Continuously captures frames from the stream and puts the latest one in a queue.
        This runs in a separate thread to prevent blocking the GUI.
        """
        # --- NEW: Set environment variables to make the connection more stable ---
        # This tells FFmpeg (used by OpenCV) to prefer TCP for RTMP transport, which is more reliable.
        os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'

        while True:
            try:
                self.status_label.config(text=f"Attempting to connect to {RTMP_URL}")
                # Use FFMPEG backend to enable more advanced options
                cap = cv2.VideoCapture(RTMP_URL, cv2.CAP_FFMPEG)
                
                # --- NEW: Increased buffer size to handle network jitter ---
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 10) 

                if not cap.isOpened():
                    print("Error: Cannot open stream. Retrying in 5 seconds...")
                    self.status_label.config(text="Cannot open stream. Retrying...")
                    time.sleep(5)
                    continue

                self.status_label.config(text="Stream connected! Capturing frames...")
                print("Stream opened successfully.")
                
                while True:
                    ret, frame = cap.read()
                    if not ret:
                        print("Stream ended or frame could not be read. Reconnecting...")
                        self.status_label.config(text="Stream ended. Reconnecting...")
                        break # Break inner loop to trigger reconnection

                    # If the queue is full, remove the old frame before adding the new one
                    if self.frame_queue.full():
                        self.frame_queue.get_nowait()
                    
                    self.frame_queue.put(frame)

            except Exception as e:
                print(f"An error occurred in the capture thread: {e}")
            finally:
                if 'cap' in locals() and cap.isOpened():
                    cap.release()
                time.sleep(5) # Wait 5 seconds before trying to reconnect

    def update_frame(self):
        """
        Pulls the latest frame from the queue and displays it on the canvas.
        This runs in the main GUI thread.
        """
        try:
            # Get the most recent frame from the queue without blocking
            frame = self.frame_queue.get_nowait()
            
            # Convert the image from BGR (OpenCV format) to RGB
            cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Convert the image to a PhotoImage that Tkinter can display
            img = Image.fromarray(cv2image)
            self.photo = ImageTk.PhotoImage(image=img)
            
            # Update the canvas with the new frame
            self.canvas.create_image(0, 0, image=self.photo, anchor=tk.NW)
            
        except queue.Empty:
            # If the queue is empty, it means no new frame is available yet.
            # We just wait for the next scheduled update.
            pass
        
        # Schedule the next frame update. 33ms is approx 30fps.
        self.window.after(33, self.update_frame)


if __name__ == '__main__':
    # Create a window and pass it to the StreamViewerApp class
    print("Starting Tkinter Stream Viewer...")
    App = StreamViewerApp(tk.Tk(), "Drone Live Stream Viewer (Robust)")
