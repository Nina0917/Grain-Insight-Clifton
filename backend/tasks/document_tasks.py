# tasks/document_tasks.py
import logging
import gc

from core.grain_analysis import get_grain_analyzer
from db.database import SessionLocal
from models.document import Document
from models.status import Status


def process_document(document_id: int):
    
    db = SessionLocal()

    try:
        document = db.query(Document).get(document_id)

        # Update status to 'Processing'
        document.status_id = db.query(Status).filter_by(name="Processing").first().id
        db.commit()

        # Use singleton grain analyzer instance
        analyzer = get_grain_analyzer()

        csv_path, mask_path = analyzer.analyze(
            document.file_path,
            output_prefix=f"storage/results/document_{document.id}",
        )

        # Update status to 'Processed' and set result paths
        processed = db.query(Status).filter_by(name="Processed").first()
        
        document.status_id = processed.id
        document.result_csv_path = csv_path
        document.result_mask_path = mask_path

    except Exception as e:
        logging.error(f"❌ Error processing document {document_id}: {e}")
        failed = db.query(Status).filter_by(name="Error").first()
        document.status_id = failed.id


    finally:
        db.commit()
        db.close()
        gc.collect()

