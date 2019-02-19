mos build --arch esp32
mos flash
mos wifi "ZTE BLADE V8 LITE" brandpitt
mos gcp-iot-setup --gcp-project grounded-nebula-209108 --gcp-region europe-west1 --gcp-registry weather-station-registry
