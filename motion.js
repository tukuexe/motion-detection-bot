let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let lastFrame = null;

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

// Motion detection logic
video.addEventListener('play', () => {
    setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (lastFrame && detectMotion(lastFrame, currentFrame)) {
            console.log("Motion detected!");

            // Capture the image
            canvas.toBlob(blob => {
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    let base64data = reader.result.split(',')[1]; // Get base64 data

                    // Trigger GitHub Actions workflow
                    fetch('https://api.github.com/repos/tukuexe/motion-detection-bot/dispatches', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'token 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',
                            'Accept': 'application/vnd.github.everest-preview+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            event_type: 'motion_detected',
                            client_payload: {
                                image: base64data
                            }
                        })
                    });
                };
            }, 'image/png');
        }

        lastFrame = currentFrame;
    }, 1000); // Check every second
});

function detectMotion(frame1, frame2) {
    // Simple motion detection by comparing pixel differences
    let diff = 0;
    for (let i = 0; i < frame1.data.length; i += 4) {
        diff += Math.abs(frame1.data[i] - frame2.data[i]);
    }
    return diff > 1000000; // Adjust threshold as needed
    }
