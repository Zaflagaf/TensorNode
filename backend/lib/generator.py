import uuid

from backend.core.caches import cache

class Generator:
    def __init__(self, iterable, id=None):
        self.iter = iter(iterable)
        self.id = id or str(uuid.uuid4())
        self.count = 0  # compteur interne

    def __iter__(self):
        return self

    def __next__(self):
        self.count += 1
        value = next(self.iter)

        # Print debug
        """ print(f"[Generator {self.id}] next() call #{self.count} at epoch {cache.current_epoch}") """

        return value