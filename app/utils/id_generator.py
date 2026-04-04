import time
import threading

class SnowflakeGenerator:
    def __init__(self, machine_id: int, epoch: int = 1712150400000):
        # Default Epoch: April 3, 2024 (in milliseconds)
        self.epoch = epoch
        self.machine_id = machine_id
        self.sequence = 0
        self.last_timestamp = -1

        # Bit allocation
        self.machine_id_bits = 10
        self.sequence_bits = 12

        # Max values
        self.max_machine_id = -1 ^ (-1 << self.machine_id_bits)
        self.max_sequence = -1 ^ (-1 << self.sequence_bits)

        if machine_id > self.max_machine_id:
            raise ValueError(f"Machine ID cannot exceed {self.max_machine_id}")

        self.lock = threading.Lock()

    def _timestamp(self):
        return int(time.time() * 1000)

    def generate(self) -> int:
        with self.lock:
            timestamp = self._timestamp()

            if timestamp < self.last_timestamp:
                raise Exception("Clock moved backwards!")

            if timestamp == self.last_timestamp:
                self.sequence = (self.sequence + 1) & self.max_sequence
                if self.sequence == 0:
                    # Sequence exhausted, wait for next millisecond
                    while timestamp <= self.last_timestamp:
                        timestamp = self._timestamp()
            else:
                self.sequence = 0

            self.last_timestamp = timestamp

            # Shift bits into place
            # 22 = 10 (machine) + 12 (sequence)
            id = ((timestamp - self.epoch) << 22) | \
                 (self.machine_id << 12) | \
                 self.sequence
            return id

# Base62 Encoding (To make the link short)
ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(num: int) -> str:
    if num == 0:
        return ALPHABET[0]
    arr = []
    base = len(ALPHABET)
    while num:
        num, rem = divmod(num, base)
        arr.append(ALPHABET[rem])
    arr.reverse()
    return ''.join(arr)

# Instance for our app
generator = SnowflakeGenerator(machine_id=1)

def generate_short_code() -> str:
    snowflake_id = generator.generate()
    return encode_base62(snowflake_id)



# Create one instance of the generator to be used everywhere
# machine_id=1 is fine for now
_generator = SnowflakeGenerator(machine_id=1)

def generate_snowflake_id() -> int:
    """Helper function to get a numeric Snowflake ID"""
    return _generator.generate()