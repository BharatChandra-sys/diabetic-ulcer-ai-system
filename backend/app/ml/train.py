import torch
import torch.nn as nn
import torch.optim as optim
from app.ml.cnn_model import create_model
from app.ml.dataset_loader import load_dataset
from app.config import settings

def train_model(dataset_path: str, epochs: int = 10, batch_size: int = 32, learning_rate: float = 0.001):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    train_loader, test_loader = load_dataset(dataset_path, batch_size=batch_size)
    
    model = create_model(num_classes=2, pretrained=True)
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for images, labels in train_loader:
            images = images.to(device)
            labels = labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.4f}")
        
        model.eval()
        correct = 0
        total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images = images.to(device)
                labels = labels.to(device)
                
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        accuracy = 100 * correct / total
        print(f"Test Accuracy: {accuracy:.2f}%")
    
    os.makedirs('models', exist_ok=True)
    torch.save(model.state_dict(), settings.model_path)
    print(f"Model saved to {settings.model_path}")
    
    return model

if __name__ == "__main__":
    import os
    dataset_path = "./datasets/images"
    if os.path.exists(dataset_path):
        train_model(dataset_path)
    else:
        print(f"Dataset not found at {dataset_path}")
