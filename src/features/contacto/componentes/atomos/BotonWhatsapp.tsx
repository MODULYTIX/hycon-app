import { Icon } from "@iconify/react"

export const BotonWhatsapp = () => {
    return (
        <section className="p-4 fixed bottom-4 right-4 bg-green-900 rounded-full h-12 w-12 flex items-center justify-center">
            <a href="https://wa.me/51902665565" target="_blank" className="flex items-center justify-center">
                <Icon icon="mdi:whatsapp" width="24" height="24" className="text-white" />
            </a>
        </section>
    )
}