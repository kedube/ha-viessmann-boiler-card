from .circulator import Circulator
from .cu3a import VitocrossalCU3A
from .mixing_valve import MixingValve
from .plate_hx import PlateHeatExchanger
from .tempering_valve import TemperingValve
from .vitocell import Vitocell300V
from .zone_valve import ZoneValve

REGISTRY = {
    'vitocrossal-300-cu3a-199': VitocrossalCU3A,
    'vitocell-300-v-56': Vitocell300V,
    'circulator-red': lambda: Circulator('circulator-red', 'red'),
    'circulator-black': lambda: Circulator('circulator-black', 'black'),
    'plate-hx': PlateHeatExchanger,
    'mixing-valve': MixingValve,
    'zone-valve': ZoneValve,
    'tempering-valve': TemperingValve,
}
