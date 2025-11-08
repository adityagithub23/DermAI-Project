# import os
# import shutil
# import pandas as pd
# from pathlib import Path
# from sklearn.model_selection import train_test_split

# # Paths
# PROJECT_DIR = Path(__file__).parent
# IMAGES_DIR = PROJECT_DIR / "HAM10000_images"
# DATA_DIR = PROJECT_DIR / "data"
# TRAIN_DIR = DATA_DIR / "train"
# TEST_DIR = DATA_DIR / "test"
# METADATA_FILE = PROJECT_DIR / "HAM10000_metadata.csv"

# # Disease classes
# CLASS_NAMES = [
#     'melanoma', 'nevus', 'basal_cell_carcinoma', 
#     'actinic_keratosis', 'benign_keratosis', 
#     'dermatofibroma', 'vascular_lesion'
# ]

# # Create train/test folders
# for folder in [TRAIN_DIR, TEST_DIR]:
#     for class_name in CLASS_NAMES:
#         (folder / class_name).mkdir(parents=True, exist_ok=True)

# # Load metadata
# df = pd.read_csv(METADATA_FILE)

# # Optional: map original disease column to lowercase class names
# # Adjust column name if needed, e.g., df['dx'] or df['disease']
# df['dx'] = df['dx'].str.lower().replace({'bcc': 'basal_cell_carcinoma'})

# # Split images per class
# for class_name in CLASS_NAMES:
#     class_images = df[df['dx'] == class_name]['image_id'].tolist()
    
#     # Split into 80% train, 20% test
#     train_imgs, test_imgs = train_test_split(class_images, test_size=0.2, random_state=42)
    
#     # Copy train images
#     for img_id in train_imgs:
#         src_file = IMAGES_DIR / f"{img_id}.jpg"
#         if src_file.exists():
#             shutil.copy(src_file, TRAIN_DIR / class_name / f"{img_id}.jpg")
    
#     # Copy test images
#     for img_id in test_imgs:
#         src_file = IMAGES_DIR / f"{img_id}.jpg"
#         if src_file.exists():
#             shutil.copy(src_file, TEST_DIR / class_name / f"{img_id}.jpg")

# print("✅ Dataset organized successfully!")
# print(f"Train folder: {TRAIN_DIR}")
# print(f"Test folder: {TEST_DIR}")


import shutil
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split

# Paths
PROJECT_DIR = Path(__file__).parent
IMAGES_DIR = PROJECT_DIR / "HAM10000_images"
DATA_DIR = PROJECT_DIR / "data"
TRAIN_DIR = DATA_DIR / "train"
TEST_DIR = DATA_DIR / "test"
METADATA_FILE = PROJECT_DIR / "HAM10000_metadata.csv"

# Map raw dx codes -> pretty folder names
DX_MAP = {
    'mel': 'melanoma',
    'nv': 'nevus',
    'bcc': 'basal_cell_carcinoma',
    'akiec': 'actinic_keratosis',
    'bkl': 'benign_keratosis',
    'df': 'dermatofibroma',
    'vasc': 'vascular_lesion'
}

# Create train/test subfolders
for folder in [TRAIN_DIR, TEST_DIR]:
    for pretty_name in DX_MAP.values():
        (folder / pretty_name).mkdir(parents=True, exist_ok=True)

# Load metadata
df = pd.read_csv(METADATA_FILE)

# Organize images per class
for dx_code, pretty_name in DX_MAP.items():
    class_images = df[df['dx'] == dx_code]['image_id'].tolist()

    if not class_images:
        print(f"⚠️  No images found for {dx_code}, skipping.")
        continue

    # 80% train / 20% test split
    train_imgs, test_imgs = train_test_split(
        class_images, test_size=0.2, random_state=42
    )

    # Copy training images
    for img_id in train_imgs:
        src = IMAGES_DIR / f"{img_id}.jpg"
        if src.exists():
            shutil.copy(src, TRAIN_DIR / pretty_name / f"{img_id}.jpg")

    # Copy testing images
    for img_id in test_imgs:
        src = IMAGES_DIR / f"{img_id}.jpg"
        if src.exists():
            shutil.copy(src, TEST_DIR / pretty_name / f"{img_id}.jpg")

print("✅ Dataset organized successfully!")
print(f"Train folder: {TRAIN_DIR}")
print(f"Test folder: {TEST_DIR}")
