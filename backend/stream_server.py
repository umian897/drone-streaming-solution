# import subprocess
# import os
# import threading
# from http.server import HTTPServer, SimpleHTTPRequestHandler
# import time

# # --- Configuration ---
# FFMPEG_PATH = "/opt/homebrew/bin/ffmpeg"  # The correct path you found
# MEDIA_ROOT = "media" # The root directory for all media files
# HLS_OUTPUT_DIR = os.path.join(MEDIA_ROOT, "live")

# def run_ffmpeg_for_stream(stream_key):
#     """
#     This function runs continuously, acting as a simple but robust RTMP server.
#     It uses FFmpeg to listen for an incoming stream and convert it to HLS.
#     """
#     while True:
#         # Ensure the directory for this specific stream exists
#         output_path = os.path.join(HLS_OUTPUT_DIR, stream_key)
#         os.makedirs(output_path, exist_ok=True)
        
#         # The RTMP input URL that FFmpeg will listen to
#         rtmp_input = f"rtmp://localhost:1935/live/{stream_key}"
        
#         # The path to the HLS playlist file FFmpeg will create
#         hls_playlist = os.path.join(output_path, "index.m3u8")

#         command = [
#             FFMPEG_PATH,
#             '-loglevel', 'error',    # Only show errors from FFmpeg
#             '-listen', '1',          # Act as an RTMP server
#             '-i', rtmp_input,
#             '-c:v', 'copy',         # Copy the video stream without re-encoding (very efficient)
#             '-c:a', 'copy',         # Copy the audio stream
#             '-f', 'hls',
#             '-hls_time', '2',
#             '-hls_list_size', '3',
#             '-hls_flags', 'delete_segments',
#             hls_playlist
#         ]

#         print("---------------------------------------------------------")
#         print(f"Python Stream Server is running.")
#         print(f"Waiting for drone stream on: rtmp://<YOUR_PUBLIC_IP>:1935/live/{stream_key}")
#         print("This will restart automatically if the stream drops.")
#         print("---------------------------------------------------------")

#         try:
#             # Start FFmpeg and print its output directly to the console for debugging
#             process = subprocess.Popen(command, stderr=subprocess.PIPE, text=True)
            
#             # Read and print FFmpeg's error output in real-time
#             for line in iter(process.stderr.readline, ''):
#                 print(f"[FFMPEG ERROR] {line.strip()}")
                
#             process.wait()

#         except FileNotFoundError:
#             print(f"--- FATAL ERROR: FFmpeg not found at '{FFMPEG_PATH}' ---")
#             break # Stop the loop if FFmpeg is not found
#         except Exception as e:
#             print(f"An error occurred: {e}")
        
#         print("FFmpeg process ended. Restarting in 5 seconds...")
#         time.sleep(5)

# def start_http_server():
#     """
#     Starts a simple web server to serve the HLS video files.
#     """
#     class CORSRequestHandler(SimpleHTTPRequestHandler):
#         def __init__(self, *args, **kwargs):
#             # Serve files from the project's root directory
#             super().__init__(*args, **kwargs)

#         def end_headers(self):
#             self.send_header('Access-Control-Allow-Origin', '*')
#             super().end_headers()

#     server_address = ('', 8000)
#     httpd = HTTPServer(server_address, CORSRequestHandler)
#     print("HTTP server for HLS is running on port 8000...")
#     httpd.serve_forever()


# if __name__ == '__main__':
#     # Create the main media directory if it doesn't exist
#     os.makedirs(HLS_OUTPUT_DIR, exist_ok=True)

#     # Start the HTTP server in a separate thread
#     http_thread = threading.Thread(target=start_http_server, daemon=True)
#     http_thread.start()

#     # Start the FFmpeg process for your drone.
#     # You can change this key to match the drone you are testing with.
#     drone_stream_key = "new-1753944702151" 
#     run_ffmpeg_for_stream(drone_stream_key)