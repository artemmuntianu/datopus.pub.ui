import { CdkPortalOutlet, ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import { ComponentRef } from "@angular/core";

export abstract class PortalService {
	private portalOutlet: CdkPortalOutlet | null = null;

	setPortalOutlet(outlet: CdkPortalOutlet) {
		this.portalOutlet = outlet;
	}

	attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> | undefined {
		return this.portalOutlet?.attach(portal);
	}

	attachTemplatePortal(portal: TemplatePortal) {
		this.portalOutlet?.attach(portal);
	}

	clear() {
		this.portalOutlet?.detach();
	}
}
